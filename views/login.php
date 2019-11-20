<article id="mainwelcome" class="fullpage">
  <div class="container">
    <div class="mainblurb">
      <div>Log In To Start</div>
      <div>Getting Froogle</div>
      <hr/>
    </div>
    <div class="subblurb">If you don't have an account go ahead and sign up</div>
    <div id="regsterbutton">
      <a href="<?php echo $this->baseurl; ?>register/" class="buttonstyle compact">sign up</a>
    </div>
  </div>
  <?php
  setMessages("errors",$data);
  setMessages("messages",$data);
  ?>
  <div class="container wimpy">
    <div class="loginbox formbox">
      <form id="loginform" action="<?php echo $this->baseurl ?>login/" method="POST">
        <div class="fieldset">
          <div id="ff-username" class="formfield">
            <input type="text" name="username" id="username" placeholder="email">
          </div>
          <div id="ff-pass" class="formfield">
            <input type="password" name="pass" id="pass" placeholder="pass phrase">
          </div>
          <div id="ff-login" class="formfield">
            <input type="submit" value="login" class="primary">
          </div>
        </div>
      </form>
    </div>
  </div>
</article>
