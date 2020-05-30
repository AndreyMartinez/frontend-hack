<script>
  import { Router, Route } from "svelte-routing";
  import MainPage from './pages/mainPage/MainPage.svelte'
  import RegisterPage from './pages/registerPage/RegisterPage.svelte'
  import LoginPage from './pages/loginPage/LoginPage.svelte'
  export let url = "";
</script>

<Router url="{url}">
<Route path="register" component="{RegisterPage}" />
<Route path="login" component="{LoginPage}" />
    <Route path="/"><MainPage /></Route>
</Router>



<style>

</style>