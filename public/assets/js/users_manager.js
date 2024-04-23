document.addEventListener('DOMContentLoaded', function() {

		async function fetchToken() {
			try {
				const response = await axios.get('/get-token');
				console.log(response.data.token);  // Use console.log para visualizar o objeto
			} catch (e) {
				console.error('Erro ao buscar token:', e);
			}
		}
		fetchToken();	
		
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

		function deleteUser(element) {
			 const confirmation = window.confirm('Tem certeza de que deseja excluir este usuário?');
			 
			 if(confirmation){
				// Encontrar a linha pai (tr) do ícone clicado
				const row = element.closest("tr");

				// Encontrar a segunda coluna (índice 1) dentro da linha, correspondente ao User ID
				const userIdCell = row.cells[1];

				// Obter o valor do User ID
				const userId = userIdCell.textContent.trim();

				const data = {
				userId: userId,
				}
			  
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(data)
				};		  
			  
			fetch('/SekhmetNutrition/admin/include/process/users_process.php', options)
				.then(response => response.json())
				.then(Responsedata => {
					if (Responsedata.error) {
						console.error('Erro na solicitação fetch:', Responsedata.error);
					} else {
						showSuccessMessage(Responsedata);
					}
				})
				.catch(error => {
					console.error('Erro na solicitação fetch:', error);
				});		  				 
			 }
		}

		//OverView dropdown
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
		function fetchUserCount() {
			fetch('/SekhmetNutrition/admin/include/process/users_category_process.php')
				.then(response => response.json())
				.then(data => {
					// Atualize o valor do elemento span com o ID "totalUsers"
					document.getElementById('totalUsers').textContent = data.totalUsers;
				})
				.catch(error => {
					console.error('Erro ao buscar contagem de usuários:', error);
				});
		}

		fetchUserCount();

		//User Logs
		function fetchUserLogs(){
			fetch('/SekhmetNutrition/admin/include/process/activity_log.php')
				.then(response => response.json())
				.then(data => {
					// Atualize o valor do elemento span com o ID "totalUsers"
					const recentActivityList = document.getElementById('recentActivityList');
					
					data.activityLogs.forEach(activity=>{
						const listItem = document.createElement('li');				
						listItem.innerHTML = `
							<span class="activity-date">${activity.activity_date}</span>
							<span class="activity-type">${activity.activity_type}</span>
							<span class="activity-details">ID ${activity.user_id}: ${activity.activity_details}</span>
						`;				
						
						recentActivityList.appendChild(listItem);				
					})
				})
				.catch(error => {
					console.error('Erro ao buscar o logs de usuários:', error);
				});	
		}

		fetchUserLogs()


		function fetchPagesLogs(){
			fetch('/SekhmetNutrition/admin/include/process/pages_count_log.php')
				.then(response =>response.json())
				.then(data =>{
					 const popularPagesList = document.getElementById('popularPagesList');
					
					 data.PagesLogs.forEach(Pages =>{
						 const listItem = document.createElement('li');
						 
						 listItem.innerHTML = `
							<span class="page-url">${Pages.page_url}</span>
							<span class="visit-count">${Pages.visit_count} visitas</span>				 
						 `
						popularPagesList.appendChild(listItem)
					 })
					 
				})
				.catch(error =>{
					console.error('Erro ao buscar o logs de pages:', error);
				})
		}

		fetchPagesLogs();

		//Overview 
		function fetchOverView(){
			fetch('/SekhmetNutrition/admin/include/process/getAvisos.php')
				.then(response => response.json())
				.then(data =>{
					const errorScreen = document.getElementById('errorScreen');
					
					data.errorData.forEach(dataLine =>{
						const lineElement = document.createElement('pre')
						
						lineElement.innerHTML = dataLine;
						errorScreen.appendChild(lineElement)
					})
				})
				.catch(error=>{
					console.error('Erro ao buscar o logs da plataforma:', error);
				})
		}

		fetchOverView()

		//Event and promotion
		function fetchEvent(){
			fetch('/SekhmetNutrition/admin/include/process/event_promotion.php')
				.then(response => response.json())
				.then(data =>{
					const eventPromotion = document.getElementById('event-promotion');
					
					
						const lineElement = document.createElement('p')
						
						lineElement.innerHTML = data;
						eventPromotion.appendChild(lineElement)
					
				})
				.catch(error=>{
					console.error('Erro ao buscar o logs da plataforma:', error);
				})
		}

		fetchEvent()


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
