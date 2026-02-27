<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Coletar os dados do formulário
    $name = htmlspecialchars($_POST['name']);
    $surname = htmlspecialchars($_POST['surname']);
    $team = htmlspecialchars($_POST['team']);
    $nationality = htmlspecialchars($_POST['nationality']);
    $playerPosition = htmlspecialchars($_POST['playerPosition']);
    $pacePoints = htmlspecialchars($_POST['pacePoints']);
    $shootingPoints = htmlspecialchars($_POST['shootingPoints']);
    $passingPoints = htmlspecialchars($_POST['passingPoints']);
    $driblingPoints = htmlspecialchars($_POST['driblingPoints']);
    $defencePoints = htmlspecialchars($_POST['defencePoints']);
    $physicalPoints = htmlspecialchars($_POST['physicalPoints']);

    // Endereço de e-mail do destinatário
    $to = 'lgspsports.ift@gmail.com';  // Altere para o e-mail desejado
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-type: text/html\r\n";

    // Mensagem do e-mail
    $email_subject = "LIYC Card Form Submission: $name $surname, $team";
    $email_body = "<html><body>";
    $email_body .= "<h1>You have received a new player card request from <strong>$team</strong></h1>";
    $email_body .= "<p><strong>Name:</strong> $name</p>";
    $email_body .= "<p><strong>Surname:</strong> $surname</p>";
    $email_body .= "<p><strong>Team:</strong> $team</p>";
    $email_body .= "<p><strong>Nationality:</strong> $nationality</p>";
    $email_body .= "<p><strong>Player Position:</strong> $playerPosition</p>";
    $email_body .= "<p><strong>Pace Points:</strong> $pacePoints</p>";
    $email_body .= "<p><strong>Shooting Points:</strong> $shootingPoints</p>";
    $email_body .= "<p><strong>Passing Points:</strong> $passingPoints</p>";
    $email_body .= "<p><strong>Dribling Points:</strong> $driblingPoints</p>";
    $email_body .= "<p><strong>Defence Points:</strong> $defencePoints</p>";
    $email_body .= "<p><strong>Physical Points:</strong> $physicalPoints</p>";
    $email_body .= "</body></html>";

    // Enviar o e-mail
    if(mail($to, $email_subject, $email_body, $headers)){
        echo("success");
    }else {
        echo("error");
    }
}
?>