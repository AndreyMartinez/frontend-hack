<script>
	import Header from '../../component/Header.svelte'
    import { navigate} from "svelte-routing";
      import { onMount } from 'svelte';

let recyclerImg = 'assets/img/init.jpg'

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
         
         center = mapsMouseEvent.latLng.toString()
        });
    });
  let container;
let  marker;
let map;
	let zoom = 12;
    let center = {lat: 4.638305561012602, lng: -74.08649498920173};

</script>

<main>  
<img src={recyclerImg} class="contentImg" alt="img"/>

<Header typeHeader={'general'}/>
<div class="content">
<div class="full-screen" bind:this={container}></div>
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