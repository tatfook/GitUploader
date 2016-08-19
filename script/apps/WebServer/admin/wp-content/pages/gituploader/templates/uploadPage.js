window.onload = function(){
	var aReposList = document.getElementsByClassName('reposList');
	for(var i = 0; i < aReposList.length; i++){
			aReposList[i].onclick = function(){
				this.style.background = 'red';
			}
	}
}
