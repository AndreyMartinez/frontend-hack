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
         
         center = mapsMouseEvent.latLng.toString()
        });
    });
  
      
const sendInfoUser = async() => {
  let date = new Date().toString()
  let Response = {
	"user_id":'',
	"latitud":center.split(',')[0].replace('(','').replace(' ',''),
	"longitud":center.split(',')[1].replace('(','').replace(' ',''),
  "fecha":date
  }
     await fetch('http://192.168.1.3:8080/api/recycle',{
    method: "POST",
    body:  JSON.stringify(Response)
   }).then(response => { notifier.success('Pronto, nos podremos en contacto')
setTimeout(()=> {
     navigate("/",{replace:true})
},3000)
      }).catch(err => {
         
      })
}
        

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
<div class="content-img">
<img src={cajas} class="img-content" alt="cajas">
</div>
<div class="content-img">
<p class="center">Quieres preguntar como salvar al mundo o programa que vayan a tú casa a recoger tu reciclaje en la parte inferior</p>
<iframe class="iframe" src="https://web-chat.global.assistant.watson.cloud.ibm.com/preview.html?region=us-south&integrationID=8dd00977-e13d-4bec-9d10-bcbef1e34444&serviceInstanceID=0a368225-b774-4ce6-b3f7-b0c83c1af98b" title="watson"/>
 </div>
 </div>
 <h1>Registra tú punto, para recoger </h1>
 <div class="content minimal-content black">
 <div class="content-img">
<h1>Paso 1  Registra tú ubicación</h1>
</div>
<div class="content-img">
<div class="full-screen" bind:this={container}></div>
</div>
</div>
 <div class="content minimal-content black">
 
<div class="content-img">
  <textarea class="form-control second-color" bind:value={textArea} id="exampleFormControlTextarea1" rows="3" placeholder="Por ejemplo: Mi casa queda al lado de la estación de policia"></textarea>

</div>
<div class="content-img">
<h1>Paso 2  Agrega una descripción de la ubicación</h1>
</div>
</div>

 <div class="content minimal-content black">
 
<div class="content-img">
<h1>Paso 3  Por último envía el formulario.Fácil, simple y sencillo</h1>
</div>
<div class="content-img">
<button type="" class="btn btn-outline-light btn-item button-minimal" on:click={sendInfoUser}>Enviar respuesta</button>
</div>
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