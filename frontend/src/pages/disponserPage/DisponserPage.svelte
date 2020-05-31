<script>
	import Header from '../../component/Header.svelte'
	  import { navigate} from "svelte-routing";
let cajas = 'assets/img/caja-01.png'
let latas = 'assets/img/cel-01.png'
let celulares = 'assets/img/latas-01.png'
let mainImg = 'assets/img/person.jpg'
let recyclerImg = 'assets/img/init.jpg'
let recycler =  localStorage.getItem('recycler')
  /**
   * @author Raphael Martinez
   * @description handler de navegación para recycler
  **/
  const routerIniciative = (type) => {
    localStorage.setItem('type',type)
     navigate(`/iniciative`,{replace:true})
  }

</script>

<main>  
{#if recycler == "error"}
<img src={mainImg} class="contentImg" alt="img"/>
{/if}
{#if recycler == "good"}
<img src={recyclerImg} class="contentImg" alt="img"/>
{/if}

<Header typeHeader={'general'}/>
<div class="content">
 <div class="content-img">
 <img src={cajas} class="img-content" alt="cajas">
 <div class="element-content">
 <h1>Quieres reciclar cartón o pàpel</h1>
 <button type="" class="btn btn-outline-light btn-item btn-disponser" on:click={() => routerIniciative('carton')}>IR</button>
 </div>
 </div>
 <div class="content-img">
 <img src={celulares} class="img-content" alt="latas">
 <div class="element-content">
 <h1>Quieres reciclar plastico o latas</h1>
 <button type="" class="btn btn-outline-light btn-item btn-disponser" on:click={() => routerIniciative('latas')}>IR</button>
 </div>
 </div>
  <div class="content-img">
 <img src={latas} class="img-content" alt="latas">
 <div class="element-content">
 <h1>Quieres reciclar elementos electrónicos</h1>
 <button type="" class="btn btn-outline-light btn-item btn-disponser" on:click={() => routerIniciative('celulares')}>IR</button>
 </div>
 </div>
 </div>
</main>
 


<style>
main {
		height: 100%;
		text-align: center;
		max-width: 100%;
		    background-size: cover;
    background-repeat: no-repeat;
  }
  .contentImg{
      position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: auto;
    z-index: -10;
    visibility: visible;
  }
  .content{ 
display: flex;
    width: 100%;
    height: 100%;
  }
  	h1 {
         width: 88%;
        margin: auto;
		color: white;
		text-transform: uppercase;
		font-size: 3.2em;
		font-weight: 100;
	}
  .content-img{
    display: flex;
    flex-grow: 1;
    
  }
  .img-content{
    margin:auto;
   width: 30%;
  }
  .element-content{
    margin: auto;
  }
  .btn-disponser{
    margin-top: 9%;
    width: 70%;
    }
</style>