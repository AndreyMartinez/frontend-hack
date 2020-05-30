<script>
	import Header from '../../component/Header.svelte'
	
	export let src = 'assets/video/main.mp4'
	export let srcIcon = 'assets/icon/down.svg'
</script>

<main >
<video autoplay reload
src={src}></video>
<Header/>
  <div class='flex'>
  <p>Informate de nuestra iniciativa a continuación</p>
	<img src={srcIcon}  class="iconImg" alt="icono down"/>
	<h1>Si tú cambias el mundo cambia </h1>

	</div>
	<!-- <div class='platform-information'>
	<h1 class="secondary-margin">Materíal que reciclamos</h1>
	<div class="content-detail">
	 <div>
	 <img  class="img" src="http://reciclapp.cl/wp-content/uploads/2020/04/caja-01.png"/>
	 <h1 class="text-secondary">Cartón  </h1>
	 </div>
	 <div>
	 <img   class="img" src="http://reciclapp.cl/wp-content/uploads/2020/04/plstico-01.png" />
	  <h1 class="text-secondary">Plasticos  </h1>
	 </div>
	 <div>
	 <img  class="img" src="http://reciclapp.cl/wp-content/uploads/2020/04/cel-01.png" />
	 <h1 class="text-secondary">Aparatos de tecnología   </h1>
	 </div>
	</div>
	</div> -->
	</main>




<style>
	main {
		height: 100%;
		text-align: center;
		max-width: 240px;
		    background-size: cover;
    background-repeat: no-repeat;
	}
	.iconImg{
	width: 5%;
    margin: 1% auto;
    height: 5%;
	}
	.flex{
		width: 50%;
		height: 102%;
		display: flex;
		flex-direction:column-reverse;
	}
	video {
		    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    z-index: -10;
    visibility: visible;
	}
	p {
		color: white;
		text-transform: uppercase;
		font-weight: 100;
	}
	
	h1 {
		color: white;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	.platform-information{
		width: 100%;
    height: 60%;
    background-color: #343a4017;
	}
	.content-detail{
		display: flex;
	}
	.img{
		margin: 10% 0;
		width: 25%;
		flex-grow: 1;
	}

.text-secondary{
	 color: black;
	 font-size: 2em
}

.secondary-margin{
	margin-top:5.5%
}
.color-text{
	color: black;
}



	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>