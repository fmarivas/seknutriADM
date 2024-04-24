document.addEventListener('DOMContentLoaded', function() {
async function fetchToken() {
	try {
		const response = await axios.get('/get-token');
		return response.data.token;  // Use console.log para visualizar o objeto
	} catch (e) {
		console.error('Erro ao buscar token:', e);
	}
}

// Funcao para exclusão de usuário
//SUcess Message when Deleting a line
function showSuccessMessage(message) {
	const successMessage = document.getElementById('successMessage');
	successMessage.innerText = message;
	successMessage.classList.add('success-message');
	successMessage.style.display = 'block';

	// Esconde a mensagem após 3 segundos (3000 milissegundos)
	setTimeout(() => {
		successMessage.style.display = 'none';
	}, 3000);
}

function showFaillureMessage(message) {
	const successMessage = document.getElementById('failureMessage');
	failureMessage.innerText = message;
	failureMessage.classList.add('failure-message');
	failureMessage.style.display = 'block';

	// Esconde a mensagem após 3 segundos (3000 milissegundos)
	setTimeout(() => {
		failureMessage.style.display = 'none';
	}, 3000);
}

async function deleteUser(userId) {
    const confirmation = window.confirm('Tem certeza de que deseja excluir este usuário?');
    if (!confirmation) return;

    try {
        const token = await fetchToken();
		const data = {
				userId: userId
			}
		
		const config = {
            headers: { 
				Authorization: `Bearer ${token}` 
			}			
		}
		
        const response = await axios.post('/delete-user', data, config);

        if (response.data.error) {
            console.error('Erro na solicitação:', response.data.error);
            showFaillureMessage(response.data.error);
        } else {
            showSuccessMessage('Usuário deletado com sucesso.');
            const userRow = document.getElementById(`user-row-${userId}`);
            if (userRow) userRow.remove();			
        }

    } catch (err) {
        console.error('Erro na solicitação:', err);
        showFaillureMessage(err.message);
    }
}


const deleteIcons = document.querySelectorAll('.fa-trash-alt.clickable');

deleteIcons.forEach(icon => {
	icon.addEventListener('click', function() {
		deleteUser(this.dataset.userId);
	});
});


// OverView dropdown
function toogleContentUpdated(element, contentId) {
	var globalContainer = document.querySelector('.header-category-section');
	var onboardElements = globalContainer.querySelectorAll('.onboard');
	
	var globalContent = document.querySelector('.content-category-section');
	var ContentElements = globalContent.querySelectorAll('.category-item');
	
	var content = document.getElementById(contentId);
	var radioInputs = document.getElementsByName('overview');
	

	onboardElements.forEach(onboardElement => {
		onboardElement.classList.remove('active');
	});


	radioInputs.forEach(btn =>{
		btn.addEventListener('change', ()=>{

			ContentElements.forEach(content =>{
				var computedStyle = window.getComputedStyle(content);
				if(computedStyle.display !== 'none'){
					content.style.display = 'none';
				}
			})					
			
			if(btn.checked){
				element.classList.add('active')
				content.style.display = 'block';
			}else{
				element.classList.remove('active');
			}
			
			// Para todos os outros elementos, remove 'active'
			radioInputs.forEach(otherBtn => {
				if (otherBtn !== btn) {
					var otherElement = document.querySelector('label[for="' + otherBtn.id + '"]').parentNode;
					otherElement.classList.remove('active');
				}
			});					
		})
	})			
}
//FUncao para ordenar os itens na Listagem de usuarios
function sortTable(header, order) {
  const table = header.parentNode.parentNode.parentNode;
  const tbody = table.querySelector("tbody");
  const rows = tbody.querySelectorAll("tr");
  
  // Obter índice da coluna baseado no cabeçalho clicado
  const index = Array.from(header.parentNode.children).indexOf(header); 
  
  // Ordenação de dados
  const sortedRows = Array.from(rows).sort((a, b) => {
	const aColText = a.querySelectorAll("td")[index].textContent; 
	const bColText = b.querySelectorAll("td")[index].textContent;
	return order === "asc" ? aColText.localeCompare(bColText) : bColText.localeCompare(aColText);    
  });
  
  // Remover todas as linhas existentes do corpo
  tbody.querySelectorAll("tr").forEach(row => row.remove());
  
  // Adicionar linhas ordenadas novamente ao corpo
  sortedRows.forEach(newRow => tbody.appendChild(newRow))

}


let previousSortColumn;

document.querySelectorAll(".sortable").forEach(header => {
  header.onclick = function() {
	 
	// Alternar ordem asc/desc
	const order = header.dataset.order === "asc" ? "desc" : "asc";  
	header.dataset.order = order;
	
  // Atualizar ícone de ordenação para a coluna clicada
	header.querySelector("i").className =
	order === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";	

	// Se houver uma coluna anterior, resetar o ícone
	if (previousSortColumn && previousSortColumn !== header) {
	  previousSortColumn.querySelector("i").className = "fas fa-sort";
	}

	// Atualizar a coluna anterior
	previousSortColumn = header;
	
	// Ordenar tabela 
	sortTable(header, order);

  }

});
			
//Relatorio de atividades

const radioInput = document.getElementsByName('relatorio')
//content
const usersContent = document.getElementById('usersContent')
const pagesContent = document.getElementById('pagesContent')
const overviewContent = document.getElementById('overviewContent')

radioInput.forEach(radio =>{
	if(radio.value == 'users'){
		radio.checked = true;
		
		document.querySelectorAll('.content-category').forEach(content =>{
			if (content.id == "usersContent") {
				content.style.display = 'block';
			} else {
				content.style.display = 'none';
			}
		})		
	}
	
	radio.addEventListener('change',() =>{
		if(radio || radio.checked){
			const content = radio.value+"Content";
			
			document.querySelectorAll('.content-category').forEach(content =>{
				content.style.display = 'none'
			})
			document.getElementById(content).style.display = "block";
			
			
		}
	})
})


//USERS
//UserContent
async function fetchUserCount() {
	try{
		const token = await fetchToken()
		const config = {
            headers: { 
				Authorization: `Bearer ${token}` 
			}			
		}
		
		const response = await axios.get('/count-users',  config)
		
		if(response.data){
			document.getElementById('totalUsers').textContent = response.data.totalUsers;			
		}else{
			document.getElementById('totalUsers').textContent = 'Error counting users'
		}
	}catch(err){
		console.error('Erro ao buscar contagem de usuários:', err);
		document.getElementById('totalUsers').textContent = 'Error counting users';
	}
}

setInterval(fetchUserCount, 30000)


		//Indicadores de Desempenho
		// Selecione os toggles 
		const toggleButtons = document.querySelectorAll('.toggleView');

		// Selecione os checkboxes
		const visibilityCheckboxes = document.querySelectorAll(".visibility");

		// Conteúdos
		const contentGoal = document.getElementById('contentGoal'); 
		const contentIdx = document.getElementById('contentIdx');

		// Percorra os botões toggle 
		toggleButtons.forEach((button, index) => {

		  button.addEventListener('click', () => {

			// Alterne os ícones ao clicar
			button.classList.toggle("fa-eye");
			button.classList.toggle("fa-eye-slash");
			
			// Encontre o checkbox correspondente pelo índice
			const checkbox = visibilityCheckboxes[index];

			// Alterne o estado do checkbox
			checkbox.checked = !checkbox.checked;

		  });

		});

		// Percorra os checkboxes
		visibilityCheckboxes.forEach(checkbox => {

		  checkbox.addEventListener('change', () => {
			
			// Encontre o conteúdo correspondente pelo ID
			const content = checkbox.id === "showIdx" ?  
			  contentIdx : contentGoal;
			
			// Mostre/oculte o conteúdo 
			content.classList.toggle('show-hide');

		  });

		});


});
