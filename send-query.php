<?php
declare(strict_types=1);

function redirect_with_status(string $status): never
{
    header('Location: index.html?status=' . rawurlencode($status) . '#enquiry-form', true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_with_status('invalid');
}

if (!empty($_POST['website'] ?? '')) {
    redirect_with_status('success');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$organization = trim((string) ($_POST['organization'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$type = (string) ($_POST['enquiry_type'] ?? 'partnership');
$consent = (string) ($_POST['consent'] ?? '');

if (
    $name === '' || strlen($name) > 100 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 160 ||
    strlen($phone) > 30 || strlen($organization) > 160 ||
    $message === '' || strlen($message) > 3000 ||
    $consent !== 'yes'
) {
    redirect_with_status('invalid');
}

$recipient = $type === 'customer-care'
    ? 'customercare@mentisgate.online'
    : 'partnerships@mentisgate.online';
$category = $type === 'customer-care' ? 'Customer care' : 'Partnership';

$safeName = str_replace(["\r", "\n"], ' ', $name);
$safeEmail = str_replace(["\r", "\n"], '', $email);
$subject = $category . ' website enquiry from ' . $safeName;
$body = implode("\n", [
    'New enquiry received through mentisgate.online',
    '',
    'Name: ' . $safeName,
    'Email: ' . $safeEmail,
    'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
    'Organization: ' . ($organization !== '' ? $organization : 'Not provided'),
    'Enquiry type: ' . $category,
    '',
    'Message:',
    $message,
]);

$headers = [
    'From: MentisGate Website <customercare@mentisgate.online>',
    'Reply-To: ' . $safeEmail,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));
redirect_with_status($sent ? 'success' : 'error');
