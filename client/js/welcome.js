var popupWelcome = function(username) {
    popup.update(   "Bienvenue !", 
                    "Bonjour <b class='text-primary'>" + username + "</b> !<br/><br/>Ceci est votre première visite sur le service de devis et facture. Vous n'avez pas encore <b>configuré votre société</b>. Il s'agit de la première étape pour paramétrer le logiciel.<br/><br/>Cliquez sur le bouton « <b>Configurer =&gt;</b> » pour commencer !",
                    "", 
                    "Configurer => ",
                    "/ownerMenu");
    popup.show();
};