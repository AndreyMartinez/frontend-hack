<script>
  import { Router, Route } from "svelte-routing";
  import MainPage from './pages/mainPage/MainPage.svelte'
  import RegisterPage from './pages/registerPage/RegisterPage.svelte'
  import LoginPage from './pages/loginPage/LoginPage.svelte'
  import DisponserPage from './pages/disponserPage/DisponserPage.svelte'
  import IniciativePage from './pages/iniciativePage/IniciativePage.svelte'
  import AdminPage from './pages/adminPage/AdminPage.svelte'
  export let url = "";
</script>

<Router url="{url}">
<Route path="register" component="{RegisterPage}" />
<Route path="login" component="{LoginPage}" />
<Route path="iniciative" component="{IniciativePage}"/>
<Route path="admin" component="{AdminPage}"/>
<Route path="recycler" component="{DisponserPage}"/>
    <Route path="/"><MainPage /></Route>
</Router>



<style>

</style>