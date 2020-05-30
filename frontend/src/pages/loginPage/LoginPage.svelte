<script>
import { navigate} from "svelte-routing";
import { NotificationDisplay, notifier } from '@beyonk/svelte-notifications'


    export let src = 'assets/video/main.mp4'


    /**
   * @author Raphael Martinez
   * @description handler de navegación para registro del usuario
  **/
  const routerMain = () => {
navigate("/",{replace:true})
  }

/**
 *@author Raphael Martinez
 *@description handler para validar autenticación de lógin
 **/
  const sendLogin = () => {
       notifier.success('Iniciando sesión')
       navigate("/recycler",{replace:true})
   console.log(email,password)
  }

  let email = null
  let password = null
</script>

<main >
<NotificationDisplay />
<video autoplay reload
src={src}></video>
<div class='flex'>
<div class="content-item">
	<h1>Si tú cambias el mundo cambia </h1>
    <form  on:submit|preventDefault={sendLogin} class="content-input">
    <input type="email" class="form-control input" bind:value={email} placeholder="correo" aria-label="email" aria-describedby="basic-addon1">
 <input type="password" class="form-control input" bind:value={password} placeholder="Contraseña" aria-label="password" aria-describedby="basic-addon1">
  
   <div class="content-button">
   <button type="button" class="btn btn-outline-light btn-item" on:click={routerMain}>Regresar</button>
   <button type="submit" class="btn btn-outline-light btn-item">Iniciar sesión</button>
   </div>
</form>
</div>
	</div>
	</main>




<style>
	main {
		height: 100%;
		text-align: center;
		max-width: 240px;
		    background-size: cover;
    background-repeat: no-repeat;
	}
    .content-item{
        display: flex;
    margin: auto;
    width: 30%;
    height: 80%;
    background-color: #00000063;
    flex-direction: column;

    }
    .content-input{
       width: 100%;
       margin: auto;
    height: 67%;
    }
	.flex{
        display: flex;
	width: 100%;
    height: 100%;
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
        width: 88%;
        margin: auto;
		color: white;
		text-transform: uppercase;
		font-size: 3.2em;
		font-weight: 100;
	}

     .input{
    width: 93%;
    height: 14%;
    margin: 5% auto;
     }

  .content-button{
    display: flex;
    flex-direction: column-reverse;
     }

     .btn-item{
    width: 80%;
    margin: 2% auto;
     }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>