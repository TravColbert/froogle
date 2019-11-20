<?php
if($auth->isLoggedIn()) {
?>
<article id="mainpage" class="fullpage">
  <div class="container">
    <div class="title">my transactions</div>
    <div id="expensetable">
      <table id="chart-table"></table>
    </div>
  </div>
</article>
<div id="bottompopup">
  <div id="expenseentry"></div>
</div>
<?php
} else {
?>
  <div id="loginbutton">
    <a href="/froogle/login/">login</a>
  </div>
<?php
}
  setMessages("errors",$data);
  setMessages("messages",$data);
?>
