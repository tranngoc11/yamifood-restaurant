$(document).ready(function(){
    const $contactForm = $("#contactForm");
    const $msgSubmit = $("#msgSubmit");

    $contactForm.validator().on("submit", function (event) {
        if (event.defaultPrevented) {
            // handle the invalid form...
            formError();
            submitMSG(false, "Did you fill in the form properly?");
        } else {
            // everything looks good!
            event.preventDefault();
            submitForm();
        }
    });

    function submitForm(){
        // Initiate Variables With Form Content
        const name = $("#name").val();
        const email = $("#email").val();
        const msg_subject = $("#msg_subject").val();
        const message = $("#message").val();

        $.ajax({
            type: "POST",
            url: "php/form-process.php",
            data: "name=" + name + "&email=" + email + "&msg_subject=" + msg_subject + "&message=" + message,
            success : function(text){
                if (text === "success"){
                    formSuccess();
                } else {
                    formError();
                    submitMSG(false,text);
                }
            }
        });
    }

    function formSuccess(){
        $contactForm[0].reset();
        submitMSG(true, "Message Submitted!");
    }

    function formError(){
        $contactForm.removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(this).removeClass();
        });
    }

    function submitMSG(valid, msg){
        let msgClasses;
        if(valid){
            msgClasses = "h3 text-center tada animated text-success";
        } else {
            msgClasses = "h3 text-center text-danger";
        }
        $msgSubmit.removeClass().addClass(msgClasses).text(msg);
    }
});
