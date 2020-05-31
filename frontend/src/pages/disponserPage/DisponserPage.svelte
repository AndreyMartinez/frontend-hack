<script>
	import Header from '../../component/Header.svelte'
	
let cajas = 'assets/img/caja-01.png'
let latas = 'assets/img/cel-01.png'
let celulares = 'assets/img/latas-01.png'
let mainImg = 'assets/img/person.jpg'
</script>

<main>  
<img src={mainImg} class="contentImg" alt="img"/>
<Header typeHeader={'general'}/>
<div class="content">
 <div class="content-img">
 <img src={cajas} class="img-content" alt="cajas">
 <h1>Quieres reciclar cartón o pàpel</h1>
 </div>
 <div class="content-img">
 <img src={latas} class="img-content" alt="latas">
 </div>
  <div class="content-img">
 <img src={celulares} class="img-content" alt="latas">
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
    margin-top: 4.5%;
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
   width: 75%;
  }
</style>