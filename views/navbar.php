<header>
  <nav>
    <div id="menu-title">
      <div id="app-title">
        <a href="<?php echo $this->baseurl ?>"><?php echo $data["appname"] ?></a>
      </div>
    </div>
    <div class="navlinks">
      <ul>
        <input class="hidden" id="show-menu" type="checkbox" role="button">
        <li class="menu-link">
          <a href="<?php echo $this->baseurl ?>blog/"><div class="nobreak">blog</div></a>
        </li>
        <?php if($auth->isLoggedIn()) { ?>
          <li class="menu-link">
            <a href="<?php echo $this->baseurl ?>settings/"><div class="nobreak">settings</div></a>
          </li>
          <li class="menu-link">
            <a href="<?php echo $this->baseurl ?>logout/"><div class="nobreak">logout</div></a>
          </li>
        <?php } ?>
        <?php if(!$auth->isLoggedIn()) { ?>
          <li class="menu-link">
            <a href="<?php echo $this->baseurl ?>login/"><div class="nobreak">login</div></a>
          </li>
          <li class="menu-link">
            <a href="<?php echo $this->baseurl ?>register/"><div class="nobreak">sign up</div></a>
          </li>
        <?php } ?>
        <li><label id="menu-hamburger" for="show-menu">☰</label></li>
      </ul>
    </div>
  </nav>
</header>