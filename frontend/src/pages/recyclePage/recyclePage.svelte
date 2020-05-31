<script>
  import Header from '../../component/Header.svelte'
   import { NotificationDisplay, notifier } from '@beyonk/svelte-notifications'
  import { onMount } from 'svelte';

  /** 
   * @author Raphael Martinez 
   * @description handler para agregar configuración del mapa 
   **/
onMount(async () => {
		map = new google.maps.Map(container, {
            zoom,
		     	center
        });
          
     map.addListener('click', function(mapsMouseEvent) {
          marker = new google.maps.Marker({
             position: mapsMouseEvent.latLng,
            animation: google.maps.Animation.DROP,
            icon: 'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
          });
          marker.setMap(map);
         
        });
    });
        

let cajas = 'assets/img/caja-01.png'
let latas = 'assets/img/cel-01.png'
let celulares = 'assets/img/latas-01.png'
let mainImg = 'assets/img/person.jpg'
let finalImg = 'assets/img/final.jpg'
let container;
let  marker;
let map;
	let zoom = 12;
    let center = {lat: 4.638305561012602, lng: -74.08649498920173};
let textArea  
   let themes = { 
  success: '#28a74559',
}
    
	
</script>

<main>  
<NotificationDisplay {themes}/>
<img src={mainImg} class="contentImg" alt="img"/>
<Header typeHeader={'general'}/>
<div class="content">

<div class="full-screen" bind:this={container}></div>
</div>
</main>
 


<style>
.full-screen {

    border-radius: 2%;
   width: 100%;
    height: 50vh;
    margin: auto;
}
.iframe{
    width: 80%;
height: 70%;
border-radius: 5%;
margin: auto
}
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
  .black{
      background-color: #171717;
  }
  .second-color{
        background-color: #f5f5f5f0;
    margin: auto;
    height: 29vh;
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
  width: 100%;
    display: flex;
    flex-grow: 1;
    
  }
  .img-content{
    margin:auto;
   width: 60%;
  }
  .center{
      margin:auto;
      width: 33%;
      	color: white;
		text-transform: uppercase;
		font-size: 1.5em;
		font-weight: 100;
      
      }
      .minimal-content{
              height: 60%;
      }
      .button-minimal{
            margin: auto;
    width: 70%;
    height: 20%;

      }
</style>