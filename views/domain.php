<?php
if($auth->isLoggedIn()) {
  if($data["response_code"]===200 && count($data["result"])>0) {
    $domainId = $data["result"][0]["id"];
    $domainName = $data["result"][0]["name"];
    $domainDescription = $data["result"][0]["description"];
  }
?>
<article id="domainpage" class="fullpage">
  <div class="container">
    <div class="title"><?php echo $domainName; ?></div>
    <form id="form_editdomain" action="/froogle/domain/<?php echo $domainId ?>/" method="POST" class="form--vertical">
      <div class="fieldset">
        <div id="ff-domainname" class="formfield">
          <label for="domain-name">Domain Name</label>
          <input type="hidden" name="id" id="domain-id" value="<?php echo $domainId ?>" class="form-input">
          <input type="text" name="domain" id="domain-name" placeholder="domain name" value="<?php echo $domainName; ?>" class="form-input" tabindex=1>
        </div>
        <div id="ff-description" class="formfield">
          <label for="domain-description">Description</label>
          <textarea name="description" id="domain-description" class="noresize form-input" placeholder="description" tabindex=1><?php echo $domainDescription ?></textarea>
        </div>
        <div id="ff-update" class="formfield">
          <div onClick="updateDomain(<?php echo $domainId ?>)" class="buttonstyle primary">
            <i class="fas fa-pencil-alt"></i>update
          </div>
        </div>
        <div id="ff-delete" class="formfield">
          <div onClick="deleteDomain(<?php echo $domainId ?>)" class="buttonstyle danger">
            <i class="far fa-trash-alt"></i>delete
          </div>
        </div>
      </div>
    </form>
    <form id="form_addusertodomain" action="/froogle/users_domains/<?php echo $domainId ?>/" methid="POST" class="form--vertical">
      <div class="fieldset">
        <div id="ff-domain-user" class="formfield">
          <label for="domain-user">Add User Email</label>
          <input type="hidden" name="id" id="domain-id" value="<?php echo $domainId ?>" class="form-input">
          <input type="text" name="email" id="domain-user" placeholder="user email address" class="form-input" tabindex=1>
        </div>
        <div id="ff-add-domain-user" class="formfield">
          <!-- <input type="button" value="add" onClick="submitForm('form_addusertodomain')" tabindex=1> -->
          <div onClick="submitForm('form_addusertodomain')" class="buttonstyle secondary">
            <i class="fas fa-plus"></i>add
          </div>
        </div>
      </div>
    </form>
    <form>
      <div class="fieldset">
        <div id="ff-cancel" class="formfield">
          <div onClick="goTo('/froogle/domains/')" class="buttonstyle warning">
            <i class="fas fa-arrow-left"></i>cancel
          </div>
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