document.addEventListener('DOMContentLoaded', () => {


const fnameInput = document.querySelector('input[name="fname"]');
const lnameInput = document.querySelector('input[name="lname"]');
const emailInput = document.querySelector('input[name="email"]');
const passwordInput = document.querySelector('input[name="password"]');
const confirmPasswordInput = document.querySelector('input[name="confirm_password"]');

//Group
const fnameGroup = document.getElementById('fname-group');
const lnameGroup = document.getElementById('lname-group');
const emailGroup = document.getElementById('email-group');
const passGroup = document.getElementById('pass-group');
const cPassGroup = document.getElementById('cpass-group');

//Form
const form1 = document.getElementById('registration-form');               

//COnfirming if the password and confirmation are the same
confirmPasswordInput.addEventListener('input', () => {
  if (passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.style.borderColor = 'red';
    passwordInput.style.borderColor = 'red';
  } else {
    confirmPasswordInput.style.borderColor = '';
    passwordInput.style.borderColor = '';
  }
});

passwordInput.addEventListener('input', () => {
  if (passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.style.borderColor = 'red';
    passwordInput.style.borderColor = 'red';
  } else {
    confirmPasswordInput.style.borderColor = '';
    passwordInput.style.borderColor = '';
  }
});


form1.addEventListener('submit', (event) => {
	event.preventDefault();

	clearErrorMessages(fnameGroup);
	clearErrorMessages(lnameGroup);
	clearErrorMessages(emailGroup);
	clearErrorMessages(passGroup);
	clearErrorMessages(cPassGroup);	
	clearErrorMessages(form1);	
	
    const fname = fnameInput.value.trim();
    const lname = lnameInput.value.trim();
    const email = emailInput.value.trim();
    const Password = passwordInput.value.trim();
    const cPassword = confirmPasswordInput.value.trim();


    // Dados a serem enviados para o servidor
    const data = {
        fname: fname,
        lname: lname,
        email: email,
        pass: Password,
        cpass: cPassword,
    };

    // Configuração do objeto de opções para a solicitação fetch
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // Enviar a solicitação fetch
    fetch('register_processing.php', options)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                // Processar mensagens de erro
                if (data.errors.fname) {
                    displayErrorMessage(fnameGroup, data.errors.fname);
                }
                if (data.errors.lname) {
                    displayErrorMessage(lnameGroup, data.errors.lname);
                }
                if (data.errors.email) {
                    displayErrorMessage(emailGroup, data.errors.email);
                }
                if (data.errors.pass) {
                    displayErrorMessage(passGroup, data.errors.pass);
                }
                if (data.errors.cpass) {
                    displayErrorMessage(cPassGroup, data.errors.cpass);
                }
				
				//Feedback about data at the top of the form
                if (data.errors.emailError) {
                    displayFormMessage(form1, data.errors.emailError);
                }
                if (data.errors.passwordLength) {
                    displayFormMessage(form1, data.errors.passwordLength);
                }
                if (data.errors.passwordDigit) {
                    displayFormMessage(form1, data.errors.passwordDigit);
                }
                if (data.errors.passwordUppercase) {
                    displayFormMessage(form1, data.errors.passwordUppercase);
                }
                if (data.errors.passErrorMatch) {
                    displayFormMessage(form1, data.errors.passErrorMatch);
                }
                if (data.errors.message) {
                    displayFormMessage(form1, data.errors.message);
                }
            } else {
                // Limpar todas as mensagens de erro em caso de sucesso
                clearErrorMessages(fnameGroup);
                clearErrorMessages(lnameGroup);
                clearErrorMessages(emailGroup);
                clearErrorMessages(passGroup);
                clearErrorMessages(cPassGroup);
				
				window.location.href = 'verification';
            }			
        })
        .catch(error => {
            console.error('Erro na solicitação fetch:', error);
        });
});

    function clearErrorMessages(container) {
        // Remove todas as mensagens de erro dentro do contêiner especificado
        const errorMsgs = container.querySelectorAll('.text-danger');
        errorMsgs.forEach((errorMsg) => {
            errorMsg.remove();
        });
    }

    function displayErrorMessage(container, message) {
        // Exibir uma mensagem de erro dentro do contêiner especificado
        const errorElement = document.createElement('div');
        errorElement.className = 'text-danger';
        errorElement.textContent = message;
        container.append(errorElement);
    }
	
    function displayFormMessage(container, message) {
        // Exibir uma mensagem de erro dentro do contêiner especificado
        const errorElement = document.createElement('div');
        errorElement.className = 'text-danger';
        errorElement.textContent = message;
        container.prepend(errorElement);
    }
	
});
