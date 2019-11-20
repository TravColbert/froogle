<div class="bigbanner">
  <div class="welcome">
    <a href="/froogle/">
      <?php echo $data["appname"] ?>
    </a>
  </div>
  <?php
  setMessages("errors",$data);
  setMessages("messages",$data);
  ?>
  <div id="categoryentry"></div>
  <div id="logoutbutton">
    <a href="/froogle/logout/">logout</a>
  </div>
</div>