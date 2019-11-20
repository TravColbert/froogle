<article id="mainpage">
  <div class="container">
    <div id="expenseedit" data-expenseid="<?php echo $data["result"][0]["id"] ?>"></div>
  </div>
  <?php
    setMessages("errors",$data);
    setMessages("messages",$data);
  ?>
</article>