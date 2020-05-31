<script>
	import Header from '../../component/Header.svelte'
    import { navigate} from "svelte-routing";
<<<<<<< HEAD
      import { onMount } from 'svelte';

let recyclerImg = 'assets/img/init.jpg'
=======
   import { NotificationDisplay, notifier } from '@beyonk/svelte-notifications'
  import { onMount } from 'svelte';
  import Chart from 'svelte-frappe-charts';
>>>>>>> Raphael Martinez:  feat prototype

 
  /** 
   * @author Raphael Martinez 
   * @description handler para agregar configuración del mapa 
   **/
onMount(async () => {
		map = new google.maps.Map(container, {
            zoom,
		     	center
        });
          
<<<<<<< HEAD
     map.addListener('click', function(mapsMouseEvent) {
          marker = new google.maps.Marker({
             position: mapsMouseEvent.latLng,
=======
          await fetch('http://192.168.1.3:8080/api/recycling').then(response => {
            return response.json()
          }).then(contentResponse => {
            contentResponse.responseContent.forEach(element => {
           
               let icon = ""
            if(element.tipo === "carton")  {
              icon =  'http://maps.google.com/mapfiles/ms/micons/green-dot.png'
               data.datasets[0].values[0] += 1
              }
            else if (element.tipo === "latas")  { 
              icon =  'http://maps.google.com/mapfiles/ms/micons/blue-dot.png'
              data.datasets[1].values[0] += 1
              }
            else if (element.tipo === "celulares") {
               icon =  'http://maps.google.com/mapfiles/ms/micons/yellow-dot.png'
            data.datasets[2].values[0] += 1
            }
                marker = new google.maps.Marker({
             position: {lat: parseFloat(element.latitud), lng: parseFloat(element.longitud)},
>>>>>>> Raphael Martinez:  feat prototype
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
 let data = {
    labels: ['reciclaje'],
    datasets: [
        { name: "Cartón", values: [0] },
      { name: "Latas", values: [0] },
       { name: "Electrónico", values: [0] }
      
    ],
   
  };
	let zoom = 12;
    let center = {lat: 4.638305561012602, lng: -74.08649498920173};

</script>

<main>  
<img src={recyclerImg} class="contentImg" alt="img"/>

<Header typeHeader={'general'}/>
<div class="content">
<<<<<<< HEAD
<div class="full-screen" bind:this={container}></div>
 </div>
</main>
=======
<div class="content">
<div class="second-color">
<div class="box-content box-content-one"></div> <p>Cartón</p>
<div class="box-content box-content-two"></div> <p>Latas</p>
<div class="box-content box-content-three"></div> <p>Electrónico</p>
</div>
<div class="full-screen" bind:this={container}></div>
 </div>
 <div class="content"> 
 <h1>Qué se está reciclando</h1>
 <Chart data={data} height=300 type="bar"  colors={['#04e84d', '#6992fc', '#fdf569']} />
 </div>
 </div>
 </main>
>>>>>>> Raphael Martinez:  feat prototype
 


<style>
<<<<<<< HEAD
=======
.full-screen {
  border-radius: 2%;
    width: 70%;
    height: 60vh;
    margin: auto;
        margin-top: 0
}
>>>>>>> Raphael Martinez:  feat prototype
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
<<<<<<< HEAD
  .btn-disponser{
    margin-top: 9%;
    width: 70%;
    }
=======
  	h1 {
         width: 88%;
            margin: 2% auto;
		color: white;
		text-transform: uppercase;
		font-size: 2.2em;
		font-weight: 100;
	}
>>>>>>> Raphael Martinez:  feat prototype
</style>