<?php
if($auth->isLoggedIn()) {
?>
<article id="accountspage" class="fullpage">
  <div class="container">
    <div class="title">My Accounts</div>
    <div id="list-domains"></div>
    <form id="form_adddomain" action="/froogle/domain/" method="POST" class="form--vertical">
      <div class="fieldset">
        <div id="ff-domain" class="formfield required">
          <label for="domain">Domain Name</label>
          <input type="text" name="domain" id="domain" placeholder="domain name">
        </div>
        <div id="ff-description" class="formfield required">
          <label for="description">Description</label>
          <textarea id="description" name="description" class="noresize" placeholder="description"></textarea>
        </div>
        <div id="ff-create" class="formfield">
          <input type="button" value="create" class="primary" onClick="addDomain()">
        </div>
      </div>
    </form>
  </div>
</article>
<?php
}
setMessages("errors",$data);
setMessages("messages",$data);
?>