<?php
Class Froogle {
  private $phpht;
  private $auth;
  private $db;

  function __construct($phpht, $db) {
    global $auth;
    $this->phpht = $phpht;
    $this->auth = $auth;
    $this->db = $db;
  }

  private function getDateTime($dateTimeString=null) {
    return new DateTime($dateTimeString);
  }

  public function createDomain($domainName, $domainDescription, $userId, $currentDateTime, $data = []) {
    $sql = "INSERT INTO domains VALUES (null, :name, :description, null, :currentDate, '', :userId)";
    $sqlstmt = $this->db->prepare($sql);
    syslog(LOG_INFO,"DESCRIPTION: " . $domainDescription);
    if($sqlstmt) {
      $count = $sqlstmt->execute(array(':name' => $domainName, ':description' => $domainDescription, ':currentDate' => $currentDateTime, ':userId' => $userId));
      syslog(LOG_INFO,"Record count: $count");
      if($count > 0) {
        $domainId = $this->db->lastInsertId();
        $data["response_code"] = 201;
        $data["messages"][] = "domain \"$domainName\" added";
        $data["domainId"] = $domainId;
        $data["resource"] = array("domain" => "domains/$domainId");
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to complete domain registration for \"$domainName\"";
        $data["errors"][] = "(domain name probably already exists)";
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to complete domain registration for \"$domainName\"";
    }
    return $data;
  }

  protected function createExpense($expenseTypeId,$date,$amount,$provider,$category,$note,$currentDateTime,$domainId,$userId,$data = []) {
    // $userId = $this->checkAuth();
    syslog(LOG_INFO,"attempting to add expense");
    $sql = "INSERT INTO expenses VALUES (null, :expenseTypeId, :date, :amount, :provider, :category, :note, 1, :currentDate, '', :userId, :domainId)";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(':expenseTypeId' => $expenseTypeId, ':date' => $date, ':amount' => $amount, ':provider' => $provider, ':category' => strToLower($category), ':note' => $note, ':currentDate' => $currentDateTime, ':userId' => $userId, ':domainId' => $domainId))) {
        $expenseId = $this->db->lastInsertId();
        $data["response_code"] = 201;
        $data["messages"][] = "expense \"$expenseId\" added";
        $data["expenseId"] = $expenseId;
        $data["resource"] = array("expense" => "expenses/$expenseId");
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to register expense";  
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to register expense";  
    }
    return $data;
  }

  public function createUserDomain($userId, $domainId, $currentDateTime = '', $data = []) {
    $this->checkAuth();
    if(!isset($userId) || !isset($domainId)) {
      $data["response_code"] = 400;
      $data["errors"][] = "POST data incorrect";
    }
    syslog(LOG_INFO,"attempting add of user: $userId to domain: $domainId");
    $sql = "INSERT INTO users_domains VALUES (:userId, :domainId, :currentDate, '')";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      $count = $sqlstmt->execute(array(':userId' => $userId, ':domainId' => $domainId, ':currentDate' => $currentDateTime));
      syslog(LOG_INFO,"Record count: $count");
      if($count > 0) {
        $data["response_code"] = 201;
        $data["messages"][] = "domain connected to current user";
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to create linkage between domain and user";
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to create linkage between domain and user";
    }
    return $data;
  }

  private function checkAuth() {
    syslog(LOG_INFO,"checking if user is authenticated...");
    if($this->auth->isLoggedIn()) {
      syslog(LOG_INFO,"user is authenticated");
      return $this->auth->getUserId();
    }
    return $this->goLogin();
  }

  protected function createCategory($categoryName, $domainId , $description = '', $currentDateTime = '', $data = []) {
    $this->checkAuth();
    syslog(LOG_INFO,"attempting create category");
    $name = strToLower($categoryName);
    $sql = "INSERT INTO categories VALUES (null, :name, :description, :currentDate, '', :domainId)";
    syslog(LOG_INFO,"sql: " . $sql);
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      $result = $sqlstmt->execute(array(':name' => $categoryName, ':description' => $description, ':currentDate' => $currentDateTime, ':domainId' => $domainId));
      if($result) {
        $categoryId = $this->db->lastInsertId();
        $data["response_code"] = 201;
        $data["result"][] = array("id" => $categoryId);
        $data["messages"][] = "category \"$categoryName\" added";
        $data["categoryId"] = $categoryId;
        $data["resource"] = array("expense" => "expenses/$categoryId");
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to create category";
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to create category";
    }
    return $data;
  }

  protected function delDomain($userId,$domainId) {
    if(!isset($domainId)) {
      $data["response_code"] = 400;
      $data["errors"][] = "POST data incorrect";
    }
    if(!$this->userOwnsDomain($userId,$domainId)) {
      syslog(LOG_INFO,"user does not seem to own the domain (account)");
      $data["response_code"] = 401;
      $data["errors"][] = "not owner of domain";
    }
    $sql = "UPDATE domains SET deleted=1 WHERE id=:domainId";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      $result = $sqlstmt->execute(array(":domainId" => $domainId));
      if($result) {
        $data["response_code"] = 200;
        $data["result"][] = array("id" => $domainId);
        $data["messages"][] = "domain (account) $domainId deleted";
        $data["domainId"] = $domainId;
        $data["resource"] = array("domain" => "domain/$domainId");
      } else {
        $data["response_code"] = 400;
        $data["errors"][] = "failed to delete domain (account)";  
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to delete expense";
    }
    return $data;
  }

  protected function delExpense($userId,$expenseId) {
    $uId = $this->checkAuth();
    if(!isset($matches[1])) {
      $data["response_code"] = 400;
      $data["errors"][] = "POST data incorrect";
    }
    if(!$this->userOwnsExpense($uId,$expenseId) || $uId!==$userId) {
      syslog(LOG_INFO,"user does not seem to own the expense");
      $data["response_code"] = 401;
      $data["errors"][] = "not owner of expense";
    }
    $sql = "DELETE FROM expenses WHERE id=:expenseId";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      $result = $sqlstmt->execute(array(":expenseId" => $expenseId));
      if($result) {
        $data["response_code"] = 200;
        $data["result"][] = array("id" => $expenseId);
        $data["messages"][] = "expense $expenseId deleted";
        $data["expenseId"] = $expenseId;
        $data["resource"] = array("expense" => "expenses/$expenseId");
      } else {
        $data["response_code"] = 400;
        $data["errors"][] = "failed to delete expense";  
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to delete expense";
    }
    return $data;
  }

  public function deleteDomain($matches) {
    $uId = $this->checkAuth();
    $domainId = $matches[1];
    syslog(LOG_INFO,"attempting to delete domain ".$domainId);
    $data = $this->delDomain($uId,$domainId);
    return $this->phpht->asJSON($data);
  }

  public function deleteExpense($matches) {
    $uId = $this->checkAuth();
    $expenseId = $matches[1];
    syslog(LOG_INFO,"attempting delete expense ".$expenseId);
    $data = $this->delExpense($uId,$expenseId);
    return $this->phpht->asJSON($data);
  }

  public function getCategories($matches) {
    syslog(LOG_INFO,"Getting category list");
    $userId = $this->checkAuth();
    $data = $this->readCategoriesByUserId($userId);
    return $this->phpht->asJSON($data);
  }

  public function getDomains($matches) {
    syslog(LOG_INFO,"Getting domain list");
    $userId = $this->checkAuth();
    $data = $this->readDomainsByUserId($userId);
    return $this->phpht->asJSON($data);
  }

  public function getExpense($matches) {
    $userId = $this->checkAuth();
    $data = $this->readExpense($matches[1]);
    return $this->phpht->asJSON($data);
  }

  public function getExpenses($matches) {
    $userId = $this->checkAuth();
    $data = $this->readExpenses($userId);
    return $this->phpht->asJSON($data);
  }

  public function getExpenseTypes($matches) {
    syslog(LOG_INFO,"Getting expense types list");
    $userId = $this->checkAuth();
    $data = $this->readExpenseTypes($userId);
    return $this->phpht->asJSON($data);
  }

  public function getPayees($matches) {
    syslog(LOG_INFO,"Getting payee list");
    $userId = $this->checkAuth();
    $data = $this->readPayeesByUserId($userId);
    return $this->phpht->asJSON($data);
  }

  public function goLogin() {
    syslog(LOG_INFO,"starting auth-check");
    if(!$this->auth->isLoggedIn()) {
      syslog(LOG_INFO,"must be logged-in to continue");
      $_SESSION["last_uri"] = $_SERVER["REQUEST_URI"];
      return $this->phpht->view("login.php",array("messages" => array("you must log in")));
    } else {
      // check any pre-posted return URLs in session
      syslog(LOG_INFO,"checking if last URL matches login page: ".preg_match('/\\/login\\/?$/',$_SESSION["last_uri"]));
      if(isset($_SESSION["last_uri"]) && preg_match('/\\/login\\/?$/',$_SESSION["last_uri"])===0) return header('Location: '.$_SESSION["last_uri"]);
      return $this->phpht->redirectTo($this->phpht->baseurl);
      // return $this->phpht->view();
    }  
  }

  public function goLogout() {
    syslog(LOG_INFO,"attempting logout...");
    try {
      $this->auth->logOutEverywhere();
      syslog(LOG_INFO,"logout complete");
      return $this->phpht->redirectTo($this->phpht->baseurl);
      // return $this->phpht->view();
    }
    catch (\Delight\Auth\NotLoggedInException $e) {
      syslog(LOG_INFO,"logout complete");
      return $this->phpht->redirectTo($this->phpht->baseurl);
      // return $this->phpht->view();
      // die('Not logged in');
    }
  }

  public function goVerify($matches) {
    syslog(LOG_INFO,"attempting to verify registration");
    try {
      $auth->confirmEmail($_GET['selector'], $_GET['token']);
      echo 'Email address has been verified';
      return $this->phpht->redirectTo($this->phpht->baseurl);
    }
    catch (\Delight\Auth\InvalidSelectorTokenPairException $e) {
      die('Invalid token');
    }
    catch (\Delight\Auth\TokenExpiredException $e) {
        die('Token expired');
    }
    catch (\Delight\Auth\UserAlreadyExistsException $e) {
        die('Email address already exists');
    }
    catch (\Delight\Auth\TooManyRequestsException $e) {
        die('Too many requests');
    }
  }

  public function goSettings($matches) {
    $this->checkAuth();
    syslog(LOG_INFO,"getting setup page");
    return $this->phpht->view("settings.php");
  }

  public function postCategory() {
    $userId = $this->checkAuth();
    syslog(LOG_INFO,"attempting post of category");
    syslog(LOG_INFO,"DATA: ".join(', ',$_POST));
    if(!isset($_POST["category"])) {
      syslog(LOG_INFO,"POST data incorrect");
      $data["response_code"] = 400;
      $data["errors"][] = "missing POST data";
    } else {
      syslog(LOG_INFO,"we want to view or add category: ".$_POST["category"]);
      $categoryName = $_POST["category"];
      $data = $this->readOrCreateCategory(false,$_POST["category"],$_POST["domainid"]);
    }
    return $this->phpht->asJSON($data);
  }

  public function postDomain($matches) {
    $this->checkAuth();
    syslog(LOG_INFO,"DOMAIN: ".$_POST["domain"]);
    if(!isset($_POST["domain"])) {
      syslog(LOG_INFO,"POST data incorrect");
      $result["response_code"] = 400;
      $result["errors"][] = "missing POST data";
      return $this->phpht->asJSON($result);
    } 
    $result = [];
    $userId = $this->auth->getUserId();
    $currentDateTime = $this->getDateTime()->format('Y-m-d H:i:s');
    syslog(LOG_INFO,"DATA: ".join(', ',$_POST));
    $domainName = $_POST["domain"];
    $domainDescription = (isset($_POST["description"])) ? $_POST["description"] : '';
    syslog(LOG_INFO,"DOMAIN DESCRIPTION: ".$domainDescription);
    if(count($matches)>1) {
      syslog(LOG_INFO,"attempting edit domain");
      syslog(LOG_INFO,"we want to edit domain: ".$matches[1]);
      $domainId = $matches[1];
      $result = $this->updateDomain($domainId, $domainName, $domainDescription, $userId, $currentDateTime);
    } else {
      syslog(LOG_INFO,"attempting add domain");
      syslog(LOG_INFO,"we want to add domain: ".$_POST["domain"]);
      $result = $this->createDomain($domainName, $domainDescription, $userId, $currentDateTime);
      if($result["response_code"] >= 200 && $result["response_code"] <= 299) {
        $result = $this->createUserDomain($userId, $result["domainId"], $currentDateTime, $result);
      }
    }
    return $this->phpht->asJSON($result);
  }

  public function postExpense($matches) {
    $userId = $this->checkAuth();
    syslog(LOG_INFO,"post expense");
    $data = [];
    syslog(LOG_INFO,"POST: ".join(', ',$_POST));
    if(!isset($_POST["date"]) || !isset($_POST["amount"]) || !isset($userId)) {
      syslog(LOG_INFO,"Expense data incorrect");
    }
    $expenseId = $matches[1];
    $expenseTypeId = (isset($_POST["expensetypeid"])) ? $_POST["expensetypeid"] : 0;  // cash
    $currentDateTime = $this->getDateTime()->format('Y-m-d H:i:s');
    $date = (isset($_POST["date"])) ? $_POST["date"] : $currentDateTime;
    $amount = $_POST["amount"];
    $provider = (isset($_POST["provider"])) ? $_POST["provider"] : '';
    $note = (isset($_POST["note"])) ? $_POST["note"] : '';
    $domainId = (isset($_POST["domainid"])) ? $_POST["domainid"] : null;
    $category = (isset($_POST["category"])) ? $_POST["category"] : null;
    if(count($matches)>1) {
      $data = $this->updateExpense($expenseId,$expenseTypeId,$date,$amount,$provider,$category,$note,$currentDateTime,$domainId,$userId);
    } else {
      $data = $this->createExpense($expenseTypeId,$date,$amount,$provider,$category,$note,$currentDateTime,$domainId,$userId);
    }
    return $this->phpht->asJSON($data);
  }

  public function postLogin($matches) {
    syslog(LOG_INFO,"attempting login");
    try {
      $this->auth->login($_POST["username"],$_POST["pass"]);
      syslog(LOG_INFO,"login success");
      if(isset($_SESSION["last_uri"])) header('Location: '.$_SESSION["last_uri"]);
      return $this->phpht->view();
    }
    catch (\Delight\Auth\InvalidEmailException $e) {
      return $this->phpht->view("login.php",array('errors' => array('Wrong email address')));
    }
    catch (\Delight\Auth\InvalidPasswordException $e) {
      return $this->phpht->view("login.php",array('errors' => array('Wrong password')));
    }
    catch (\Delight\Auth\EmailNotVerifiedException $e) {
      return $this->phpht->view("login.php",array('errors' => array('Email not verified')));
    }
    catch (\Delight\Auth\TooManyRequestsException $e) {
      return $this->phpht->view("login.php",array('errors' => array('Too many requests')));
    }
  }

  public function postRegister($matches) {
    syslog(LOG_INFO, "attempting register");
    try {
      $userId = $this->auth->register($_POST["email"],$_POST["pass"],null, function () {
        syslog(LOG_INFO, "user registered with ID: ".$userId);
        syslog(LOG_INFO, "user must be verified");
        syslog(LOG_INFO, "sending email verification");
      });

      // Maybe put a success message in the message queue...
      $this->phpht->view("login.php",array("message" => array("user successfully registered")));
    }
    catch (\Delight\Auth\InvalidEmailException $e) {
      die('Invalid email address');
    }
    catch (\Delight\Auth\InvalidPasswordException $e) {
        die('Invalid password');
    }
    catch (\Delight\Auth\UserAlreadyExistsException $e) {
        die('User already exists');
    }
    catch (\Delight\Auth\TooManyRequestsException $e) {
        die('Too many requests');
    }  
  }

  public function postUserDomain($matches) {
    $uId = $this->checkAuth();
    syslog(LOG_INFO,"post users-domains link");
    $data = [];
    if(!isset($_POST["email"])) {
      syslog(LOG_INFO,"user-domain matchup data missing");
      $data["response_code"] = 400;
      $data["errors"][] = "missing POST data";
      return $this->phpht->asJSON($data);
    }
    $userEmail = $_POST["email"];
    $domainId = $matches[1];
    if(!$this->userOwnsDomain($uId, $domainId)) {
      syslog(LOG_INFO,"user does not own domain");
      $data["response_code"] = 401;
      $data["errors"][] = "unauthorized";
      return $this->phpht->asJSON($data);
    }
    $userId = $this->readUserIdByUserEmail($userEmail);
    if(!$userId) {
      syslog(LOG_INFO,"user does not exist");
      $data["response_code"] = 400;
      $data["errors"][] = "user does not exist";
      return $this->phpht->asJSON($data);
    }
    $data = $this->createUserDomain($userId,$domainId);
    return $this->phpht->asJSON($data);
  }

  protected function readCategoriesByUserId($userId = false) {
    $uId = $this->checkAuth();
    $userId = ($userId) ? $userId : $uId;
    $sql = "SELECT expenses.category FROM expenses JOIN users_domains ON expenses.domainId=users_domains.domainId WHERE users_domains.userId=:userId";
    syslog(LOG_INFO,"READ query: $sql");
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userId" => $userId))) {
        $data["result"] = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        $data["response_code"] = 200;
        $data["messages"][] = "category list retrieved";
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to retrieve category list";  
      }
    } else {
      $data["response_code"] = 409;
      $data["errors"][] = "failed to retrieve category list";
    }
    return $data;
  }

  public function readDomainsByUserId($userId = null) {
    $uId = $this->checkAuth();
    $userId = (isset($userId)) ? $userId : $uId;
    syslog(LOG_INFO,"Getting domains for user: " . $userId);
    $sql = "SELECT domains.id, domains.name FROM domains JOIN users_domains ON domains.id=users_domains.domainId WHERE users_domains.userId=:userId";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(':userId' => $userId))) {
        $data["result"] = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        $data["response_code"] = 200;
        $data["messages"][] = "domain list retrieved";
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to retrieve domain list";  
      }
    } else {
      $data["response_code"] = 409;
      $data["errors"][] = "failed to retrieve domain list";
    }
    return $data;
  }

  protected function readExpense($expenseId) {
    $uId = $this->checkAuth();
    syslog(LOG_INFO,"reading expense: ${expenseId}");
    $sql = "SELECT expenses.*, users.email, expense_types.name as expenseTypeName, domains.name as domainName FROM expenses JOIN users_domains ON expenses.domainId=users_domains.domainId JOIN users ON expenses.userId=users.id JOIN expense_types ON expenses.expenseTypeId=expense_types.id JOIN domains ON expenses.domainId=domains.id WHERE users_domains.userId=:userId AND expenses.id=:expenseId";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userId" => $uId, ":expenseId" => $expenseId))) {
        $data["result"] = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        $data["response_code"] = 200;
        $data["messages"][] = "expense retrieved";
      } else {
        $data["response_code"] = 400;
        $data["errors"][] = "failed to retrieve expense list";  
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to retrieve expense list";
    }
    return $data;
  }

  protected function readExpenses($userId = false) {
    $this->checkAuth();
    syslog(LOG_INFO,"Getting expenses for user: $userId");
    $sql = "SELECT expenses.*, domains.name, users.email FROM expenses JOIN users_domains ON expenses.domainId=users_domains.domainId JOIN domains ON expenses.domainId= domains.id JOIN users ON expenses.userId=users.id WHERE users_domains.userId=:userId ORDER BY expenses.date ";
    syslog(LOG_INFO,"READ query: $sql");
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userId" => $userId))) {
        $data["result"] = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        $data["response_code"] = 200;
        $data["messages"][] = "expense list retrieved";
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to retrieve expense list";  
      }
    } else {
      $data["response_code"] = 400;
      $data["errors"][] = "failed to retrieve expense list";
    }
    return $data;
  }

  protected function readExpenseTypes() {
    $this->checkAuth();
    $sql = "SELECT * FROM expense_types";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute()) {
        $data["result"] = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        $data["response_code"] = 200;
        $data["messages"][] = "expense type list retrieved";
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to retrieve expense type list";  
      }
    } else {
      $data["response_code"] = 409;
      $data["errors"][] = "failed to retrieve expense type list";
    }
    return $data;
  }

  protected function readPayeesByUserId($userId = false) {
    $uId = $this->checkAuth();
    $userId = ($userId) ? $userId : $uId;
    $sql = "SELECT expenses.provider as payee FROM expenses JOIN users_domains ON expenses.domainId=users_domains.domainId WHERE users_domains.userId=:userId";
    syslog(LOG_INFO,"READ query: $sql");
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userId" => $userId))) {
        $data["result"] = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        $data["response_code"] = 200;
        $data["messages"][] = "category list retrieved";
      } else {
        $data["response_code"] = 409;
        $data["errors"][] = "failed to retrieve category list";  
      }
    } else {
      $data["response_code"] = 409;
      $data["errors"][] = "failed to retrieve category list";
    }
    return $data;
  }

  protected function readUserIdByUserEmail($userEmail) {
    $uId = $this->checkAuth();
    $sql = "SELECT users.id FROM users WHERE email=:userEmail";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userEmail" => $userEmail))) {
        $result = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        if(count($result)) {
          return $result[0]['id'];
        } 
      } 
    } 
    return false;
  }

  protected function updateDomain($domainId, $domainName, $domainDescription, $userId, $currentDateTime) {
    $uId = $this->checkAuth();
    if($this->userOwnsDomain($userId, $domainId)) {
      syslog(LOG_INFO,"user appears to own the domain. Performing update...");
      $sql = "UPDATE domains SET name=:name, description=:description, updatedAt=:date WHERE id=:domainId";
      $sqlstmt = $this->db->prepare($sql);
      if($sqlstmt) {
        $result = $sqlstmt->execute(array(":name" => $domainName, ":description" => $domainDescription, ":date" => $currentDateTime, "domainId" => $domainId));
        syslog(LOG_INFO,"UPDATE process returned: $result");
        if($result) {
          syslog(LOG_INFO,"SENDING SUCCESS CODE");
          $data["response_code"] = 200;
          $data["messages"][] = "domain modified";
        } else {
          syslog(LOG_INFO,"sending fail code");
          $data["response_code"] = 409;
          $data["errors"][] = "failed to modify domain";  
        }  
      } else {
        $data["response_code"] = 400;
        $data["errors"][] = "failed to form domain modification";  
      }
    } else {
      syslog(LOG_INFO,"user does not seem to own the domain");
      $data["response_code"] = 401;
      $data["errors"][] = "not owner of domain";  
    }
    return $data;
  }

  protected function updateExpense($expenseId,$expenseTypeId,$date,$amount,$provider,$category,$note,$dateTime,$domainId,$userId) {
    $uId = $this->checkAuth();
    if($this->userOwnsExpense($userId,$expenseId)) {
      syslog(LOG_INFO,"attempting update of expense ".$expenseId);
      $sql = "UPDATE expenses SET expenseTypeId=:expenseTypeId, date=:date, amount=:amount, provider=:provider, category=:category, note=:note, updatedAt=:currentDateTime, userId=:userId, domainId=:domainId WHERE id=:expenseId";
      $sqlstmt = $this->db->prepare($sql);
      if($sqlstmt) {
        $result = $sqlstmt->execute(array(":expenseId" => $expenseId, ":expenseTypeId" => $expenseTypeId, ":date" => $date, ":amount" => $amount, ":provider" => $provider, ":category" => $category, ":note" => $note, ":currentDateTime" => $dateTime, ":userId" => $userId, "domainId" => $domainId));
        syslog(LOG_INFO,"UPDATE process returned: $result");
        if($result) {
          syslog(LOG_INFO,"SENDING SUCCESS CODE");
          $data["response_code"] = 200;
          $data["messages"][] = "expense modified";
        } else {
          syslog(LOG_INFO,"sending fail code");
          $data["response_code"] = 409;
          $data["errors"][] = "failed to modify domain";  
        }  
      } else {
        $data["response_code"] = 400;
        $data["errors"][] = "failed to form expense modification";  
      }
    } else {
      syslog(LOG_INFO,"user does not seem to own the expense");
      $data["response_code"] = 401;
      $data["errors"][] = "not owner of expense";  
    }
    return $data;
  }

  protected function userOwnsDomain($userId, $domainId) {
    $uId = $this->checkAuth();
    syslog(LOG_INFO,"checking if user $userId owns domain $domainId...");
    $sql = "SELECT domainId FROM users_domains WHERE userId=:userId AND domainId=:domainId";
    $sqlstmt = $this->db->prepare($sql);
    // syslog(LOG_INFO,"SQL: ".$sqlstmt);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userId" => $userId, ":domainId" => $domainId))) {
        $count = count($sqlstmt->fetchAll(PDO::FETCH_ASSOC));
        syslog(LOG_INFO,"DOMAINS owned: ".$count);
        return ($count===1);
      }
    } 
    return false;
  }

  protected function userOwnsExpense($userId, $expenseId) {
    $uId = $this->checkAuth();
    syslog(LOG_INFO,"check if user $userId owns expense $expenseId...");
    $sql = "SELECT id FROM expenses JOIN users_domains ON expenses.domainId=users_domains.domainId WHERE expenses.id=:expenseId AND users_domains.userId=:userId";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userId" => $userId, ":expenseId" => $expenseId))) {
        $count = count($sqlstmt->fetchAll(PDO::FETCH_ASSOC));
        syslog(LOG_INFO,"Expenses owned: ".$count);
        return ($count===1);
      }
    }
    return false;
  }

  public function viewCategories($matches) {
    return $this->phpht->view("categories.php",$matches);
  }

  public function viewDomain($matches) {
    $userId = $this->checkAuth();
    syslog(LOG_INFO,join(', ',$matches));
    syslog(LOG_INFO,"Domain ID: ".$matches[1]." USER: ".$userId);
    $domainId = $matches[1];
    // Does the user own the domain?
    $sql = "SELECT * FROM domains JOIN users_domains ON domains.id=users_domains.domainId WHERE users_domains.userId = :userId AND users_domains.domainId = :domainId AND domains.ownerId = :userId";
    $sqlstmt = $this->db->prepare($sql);
    if($sqlstmt) {
      if($sqlstmt->execute(array(":userId" => $userId, ":domainId" => $domainId))) {
        $data["result"] = $sqlstmt->fetchAll(PDO::FETCH_ASSOC);
        $data["response_code"] = 200;
        $data["messages"][] = "category list retrieved";
      } else {
        $data["response_code"] = 400;
        $data["errors"][] = "failed to retrieve category list";  
      }
    } else {
      $data["response_code"] = 409;
      $data["errors"][] = "failed to retrieve category list";
    }
    return $this->phpht->view("domain.php",$data);
  }

  public function viewExpenses($matches) {
    $uId = $this->checkAuth();
    if(isset($matches[1])) {
      $data = $this->readExpense($matches[1]);
      if(count($data["result"])>0) {
        $target = "expense.php";
      } else {
        syslog(LOG_INFO,"no expense found at the resource: ".$matches[1]);
        $this->phpht->redirectTo($this->baseurl.'expenses/');
      }
      // $target = "expense.php";
    } else {
      $target = "expenses.php";
    }
    return $this->phpht->view($target,$data);
  }

  public function viewRegister($matches) {
    return $this->phpht->view("register.php");
  }
}