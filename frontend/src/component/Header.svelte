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
  

</script>


<header class="header">
 <div class="item"></div>
 <div class="principal-item"></div>
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
</header>



<style>
	.header{
      border-bottom: 0.2px solid #00000096;
      position: fixed;
      top: 0;
  width: 100%;
    display: flex;
    height: 4em;
	}
	.item{
	   flex-grow: 1;
	}
   .buttom-content{
          display: flex;
    margin: 1% 5% 0.1% 0%;
    flex-direction: row-reverse;
   }
   .principal-item{
    flex-grow: 4;
   }
   .button{
      margin:1%
   }
</style>