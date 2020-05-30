<script>
	import Header from '../../component/Header.svelte'
	

  /**
   * @author Raphael Martinez
   * @description handler de navegación para registro del usuario
  **/
  const routerRegister = (type) => {
   if(type === 'register')navigate("/register",{replace:true})
   else if (type === 'login') navigate("/login",{replace:true})
  }
  

</script>

<main>
<Header typeHeader={'general'}/>
<div>
<div></div>
<div></div>
</div>
</main>
 


<style>

</style>