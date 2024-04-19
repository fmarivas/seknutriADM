document.addEventListener('DOMContentLoaded', () => {

const profileBtn = document.getElementById('imgProfile');
const profileDropdown = document.getElementById('user-profile-dropdown');


profileBtn.addEventListener('click', ()=>{
	profileDropdown.classList.toggle('hidden');
})

// Adiciona um ouvinte de evento para fechar o dropdown quando clicar fora dele
document.addEventListener('click', function (event) {
    if (!profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.add('hidden');
    }
});

});
