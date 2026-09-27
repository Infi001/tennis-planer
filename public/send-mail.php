<?php
/**
 * TCRW-Senne Tennis-Trainingsplaner - E-Mail Versand-Skript
 * 
 * Anleitung zur Einrichtung auf deiner Website (tcrw-senne.de):
 * 1. Lade diese Datei auf deinen Webserver (z. B. nach https://tcrw-senne.de/send-mail.php)
 * 2. Trage die URL im Admin-Bereich des Trainingsplaners unter Einstellungen -> E-Mail ein.
 * 3. Fertig! Der Planer sendet alle Springer-Nachrichten nun direkt über deinen Server!
 */

// CORS-Header erlauben den Aufruf aus der Trainingsplaner Web-App
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

// Preflight OPTIONS Request direkt mit HTTP 200 beantworten
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Nur POST-Anfragen verarbeiten
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Nur POST-Anfragen sind erlaubt.']);
    exit;
}

// JSON-Body einlesen
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ungültiges JSON-Format.']);
    exit;
}

$to = isset($input['to']) ? trim($input['to']) : (isset($input['email']) ? trim($input['email']) : '');
$subject = isset($input['subject']) ? trim($input['subject']) : 'Tennis Trainingsplaner Benachrichtigung';
$message = isset($input['message']) ? $input['message'] : (isset($input['text']) ? $input['text'] : '');
$fromName = isset($input['fromName']) && !empty($input['fromName']) ? trim($input['fromName']) : 'TC Rot-Weiß Senne';
$fromEmail = isset($input['fromEmail']) && !empty($input['fromEmail']) ? trim($input['fromEmail']) : 'info@tcrw-senne.de';

// Validierung der Empfänger-Adresse
if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ungültige oder fehlende Empfänger-E-Mail-Adresse.']);
    exit;
}

// E-Mail Header aufbauen (UTF-8)
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=utf-8';
$headers[] = 'From: =?UTF-8?B?' . base64_encode($fromName) . '?= <' . $fromEmail . '>';
$headers[] = 'Reply-To: ' . $fromEmail;
$headers[] = 'X-Mailer: TCRW-Senne-Tennis-Trainingsplaner/1.0';

// Betreff UTF-8 kodieren
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

// E-Mail über den Webserver versenden
$sent = @mail($to, $encodedSubject, $message, implode("\r\n", $headers));

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'E-Mail erfolgreich via TCRW-Senne Server versendet an: ' . $to
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Der Server konnte die E-Mail nicht versenden. Bitte prüfe die PHP mail() Konfiguration deines Hosters.'
    ]);
}
