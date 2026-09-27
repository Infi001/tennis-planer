<?php
/**
 * TCRW-Senne Tennis-Trainingsplaner - E-Mail Versand-Bridge
 * 
 * Anleitung zur Einrichtung auf deiner Website (tcrw-senne.de / Strato):
 * 1. Lade diese Datei auf deinen Webserver hoch (z. B. nach https://tcrw-senne.de/send-mail.php)
 * 2. Trage die URL in den Admin-Einstellungen unter "E-Mail" ein (Standard: https://tcrw-senne.de/send-mail.php)
 * 3. Fertig! Der Planer sendet alle E-Mails sicher über deinen Strato-Server / Strato-SMTP.
 */

// CORS-Header für Aufrufe aus dem Trainingsplaner
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// GET Health Check (damit man im Browser oder per Test-Button sofort sieht, ob die Datei erreichbar ist)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'ok',
        'message' => 'TCRW-Senne E-Mail-Bridge ist aktiv und einsatzbereit!',
        'server' => $_SERVER['SERVER_NAME'] ?? 'Strato',
        'time' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Nur POST verarbeiten
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Nur POST-Anfragen sind erlaubt.']);
    exit;
}

// Input JSON auslesen
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ungültige JSON-Nutzlast.']);
    exit;
}

$to = isset($input['to']) ? trim($input['to']) : (isset($input['email']) ? trim($input['email']) : '');
$subject = isset($input['subject']) ? trim($input['subject']) : 'Tennis Trainingsplaner Benachrichtigung';
$body = isset($input['body']) ? $input['body'] : (isset($input['message']) ? $input['message'] : (isset($input['text']) ? $input['text'] : ''));
$fromName = isset($input['fromName']) && !empty($input['fromName']) ? trim($input['fromName']) : 'TCRW Montagsgruppe';
$fromEmail = isset($input['fromEmail']) && !empty($input['fromEmail']) ? trim($input['fromEmail']) : 'no-reply@rw-senne.de';

// Optional: SMTP Zugangsdaten
$smtpHost = isset($input['smtpHost']) ? trim($input['smtpHost']) : '';
$smtpPort = isset($input['smtpPort']) ? intval($input['smtpPort']) : 465;
$smtpUser = isset($input['smtpUser']) ? trim($input['smtpUser']) : '';
$smtpPass = isset($input['smtpPass']) ? trim($input['smtpPass']) : '';

if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ungültige oder fehlende Empfänger-Adresse.']);
    exit;
}

/**
 * Direkter authentifizierter SMTP-Versand via Socket
 */
function sendSmtpSocket($host, $port, $user, $pass, $fromEmail, $fromName, $to, $subject, $body) {
    $timeout = 12;
    $isSsl = ($port == 465);
    $remote = ($isSsl ? "ssl://" : "") . $host . ":" . $port;

    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client($remote, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $ctx);
    if (!$socket) {
        return "Verbindung zu $remote fehlgeschlagen: $errstr ($errno)";
    }

    stream_set_timeout($socket, $timeout);
    $greeting = fgets($socket, 515);
    if (substr($greeting, 0, 3) !== '220') {
        fclose($socket);
        return "Server-Begrüßung fehlgeschlagen: $greeting";
    }

    $helloHost = !empty($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'rw-senne.de';
    fputs($socket, "EHLO " . $helloHost . "\r\n");
    $ehlo = '';
    while ($line = fgets($socket, 515)) {
        $ehlo .= $line;
        if (substr($line, 3, 1) === ' ') break;
    }

    if (!$isSsl && ($port == 587 || stripos($ehlo, 'STARTTLS') !== false)) {
        fputs($socket, "STARTTLS\r\n");
        $res = fgets($socket, 515);
        if (substr($res, 0, 3) === '220') {
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            fputs($socket, "EHLO " . $helloHost . "\r\n");
            while ($line = fgets($socket, 515)) {
                if (substr($line, 3, 1) === ' ') break;
            }
        }
    }

    // Auth Login
    if (!empty($user) && !empty($pass)) {
        fputs($socket, "AUTH LOGIN\r\n");
        $res = fgets($socket, 515);
        if (substr($res, 0, 3) !== '334') {
            fclose($socket);
            return "AUTH LOGIN abgelehnt: $res";
        }

        fputs($socket, base64_encode($user) . "\r\n");
        $res = fgets($socket, 515);
        if (substr($res, 0, 3) !== '334') {
            fclose($socket);
            return "Benutzername abgelehnt: $res";
        }

        fputs($socket, base64_encode($pass) . "\r\n");
        $res = fgets($socket, 515);
        if (substr($res, 0, 3) !== '235') {
            fclose($socket);
            return "Passwort oder Authentifizierung fehlgeschlagen: $res";
        }
    }

    fputs($socket, "MAIL FROM:<" . $fromEmail . ">\r\n");
    $res = fgets($socket, 515);
    if (substr($res, 0, 3) !== '250') {
        fclose($socket);
        return "MAIL FROM abgelehnt: $res";
    }

    fputs($socket, "RCPT TO:<" . $to . ">\r\n");
    $res = fgets($socket, 515);
    if (substr($res, 0, 3) !== '250') {
        fclose($socket);
        return "Empfänger ($to) abgelehnt: $res";
    }

    fputs($socket, "DATA\r\n");
    $res = fgets($socket, 515);
    if (substr($res, 0, 3) !== '354') {
        fclose($socket);
        return "DATA Befehl abgelehnt: $res";
    }

    $headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <" . $fromEmail . ">",
        "Reply-To: <" . $fromEmail . ">",
        "To: <" . $to . ">",
        "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
        "Date: " . date('r'),
        "X-Mailer: TCRW-Senne-Trainingsplaner"
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n";
    fputs($socket, $payload);
    $res = fgets($socket, 515);
    fputs($socket, "QUIT\r\n");
    fclose($socket);

    if (substr($res, 0, 3) === '250') {
        return true;
    }
    return "Zustellung nicht bestätigt: $res";
}

// 1. Falls SMTP-Host & Benutzer angegeben sind -> Authentifiziert über SMTP senden
if (!empty($smtpHost) && !empty($smtpUser) && !empty($smtpPass)) {
    $smtpResult = sendSmtpSocket($smtpHost, $smtpPort, $smtpUser, $smtpPass, $fromEmail, $fromName, $to, $subject, $body);
    if ($smtpResult === true) {
        echo json_encode([
            'success' => true,
            'message' => "E-Mail erfolgreich via SMTP ($smtpHost) an $to gesendet!"
        ]);
        exit;
    }
    // Falls Socket fehlschlägt, versuchen wir noch den PHP mail() Fallback
    $smtpErrorDetail = $smtpResult;
}

// 2. Fallback: PHP mail() über den Strato-Server
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: =?UTF-8?B?' . base64_encode($fromName) . '?= <' . $fromEmail . '>',
    'Reply-To: ' . $fromEmail,
    'X-Mailer: TCRW-Senne-Trainingsplaner'
];

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($to, $encodedSubject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => "E-Mail erfolgreich über Webserver an $to versendet!"
    ]);
} else {
    http_response_code(500);
    $msg = 'E-Mail konnte vom Server nicht versendet werden.';
    if (!empty($smtpErrorDetail)) {
        $msg .= " (SMTP-Fehler: $smtpErrorDetail)";
    }
    echo json_encode([
        'success' => false,
        'error' => $msg
    ]);
}
