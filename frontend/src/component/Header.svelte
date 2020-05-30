<script>
  import { navigate} from "svelte-routing";
 import { Button } from 'sveltestrap';

  /**
   * @author Raphael Martinez
   * @description handler de navegación para registro del usuario
  **/
  const routerRegister = (type) => {
   if(type === 'register')navigate("/register",{replace:true})
   else if (type === 'login') navigate("/login",{replace:true})
  }
  
  export let typeHeader;
  let img = 'assets/img/user.png'
 console.log(typeHeader)
</script>


<header class="header">
 <div class="item"></div>
 <div class="principal-item"></div>
{#if typeHeader == "login"}
 <div class="item buttom-content">
 <div>
 <Button class="button" color="dark" outline on:click={() => routerRegister('login')}>
  Iniciar sesión
</Button>
<Button class="button" color="dark" outline inse on:click={() => routerRegister('register')}>
  registrarse
</Button>
 </div>
 </div>
   {/if}
{#if typeHeader == "general"}
<div class="item info-user">
<div class="flex">
   <img class="img-circle"  src={img} alt="user"/>
</div>
</div>
{/if}
</header>



<style>
	.header{
      border-bottom: 0.2px solid #00000096;
          -webkit-box-shadow: 0px 0px 7px 0px #00000096;
      position: fixed;
      top: 0;
  width: 100%;
    display: flex;
    height: 4.5em;
	}
	.item{
	   flex-grow: 1;
	}
   .buttom-content{
          display: flex;
    margin: 1% 5% 0.1% 0%;
    flex-direction: row-reverse;
   }
   .info-user{
          display: flex;
    flex-direction: row-reverse;
   }
   
   .principal-item{
    flex-grow: 4;
   }
   .button{
      margin:1%
   }
   .img-circle{
      border-radius: 53%;
    width: 83%;
    height: 92%;
    margin: 5% 0;
   }
   .flex{
      display: flex;
   }
</style>