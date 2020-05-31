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
   * @author Raphael Martinez 
   * @description handler encargado de guardar el registro del usuario
   **/
  const sendRegister = async() => {
   
      await fetch('http://192.168.1.3:8080/api/register',{
    method: "POST",
    body:  JSON.stringify({
        'email':email,
        'telefono':number,
        'clave':password,
        'rol':'disponedor'
    })
   }).then(response => {
notifier.success('Usuario registrado correctamente')
setTimeout(()=> {
     navigate("/",{replace:true})
},3000)
      }).catch(err => {
         console.log(err)
      })
   }


  let email = null
  let number = null 
  let password = null

  let themes = { 
  success: '#28a74559',
}
</script>

<main >
<NotificationDisplay {themes}/>
<video autoplay reload
src={src}></video>
<div class='flex'>
<div class="content-item">
	<h1>Si tú cambias el mundo cambia </h1>
    <form class="content-input" on:submit|preventDefault={sendRegister}>
    <input type="email" bind:value={email} class="form-control input" placeholder="correo" aria-label="email" aria-describedby="basic-addon1" required>
  <input type="number" bind:value={number} class="form-control input" placeholder="Télefono" aria-label="phone" aria-describedby="basic-addon1" required minlength=9>
  <input type="password" bind:value={password} class="form-control input" placeholder="Contraseña" aria-label="password" aria-describedby="basic-addon1" required>
  
   <div class="content-button">
   <button type="button" class="btn btn-outline-light btn-item" on:click={routerMain}>Regresar</button>
   <button type="submit" class="btn btn-outline-light btn-item">Registrar usuario</button>
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
    height: 13%;
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