<?php
// Receives the popup lead form and emails it to the business inbox.
header('Content-Type: application/json');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$to = 'msconstructionserviceslahore@gmail.com';
function clean($k, $max = 120) {
  $v = isset($_POST[$k]) ? (string)$_POST[$k] : '';
  $v = preg_replace('/[\r\n\t]+/', ' ', strip_tags($v));
  return trim(mb_substr($v, 0, $max));
}
// Honeypot: bots fill this hidden field
if (clean('website') !== '') { echo '{"ok":true}'; exit; }

$name = clean('name'); $phone = preg_replace('/\D/', '', clean('phone', 20));
$size = clean('size', 20); $society = clean('society'); $map = clean('map', 5);
$page = clean('page', 200);
if ($name === '' || !preg_match('/^\d{10,13}$/', $phone) || $size === '' || $society === '' || $map === '') {
  http_response_code(400); echo '{"ok":false}'; exit;
}

$host = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'msconstruction.services');
$subject = "New lead: $name - $size - $society";
$body = "New website lead (popup form)\n\n"
  . "Name: $name\nPhone: $phone\nPlot Size: $size\nSociety: $society\nMap Ready: $map\n\n"
  . "Page: $page\nTime: " . date('Y-m-d H:i:s') . " (server)\n";
$headers = "From: MS Construction Website <noreply@$host>\r\nContent-Type: text/plain; charset=UTF-8\r\n";

$ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
echo json_encode(['ok' => (bool)$ok]);
