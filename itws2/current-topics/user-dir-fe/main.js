function hide_all_containers() {
  // TODO: consider refactoring to addClass in a loop
  console.log("hide containers");
  $('#index-container').addClass("hidden");
  $('#add-user-container').addClass("hidden");
  $('#edit-user-container').addClass("hidden");
  $('#delete-user-container').addClass("hidden");
};

var create_hash_setter = function(hash) {
  return function() {
    window.location.hash = hash;
  };
};

var setAddHash = create_hash_setter('add_user');

var setEditHash = create_hash_setter('edit_user');

var setDelHash = create_hash_setter('delete_user');

var setIndexHash = create_hash_setter('index');

function navigate(path) {
  var current = window.location.href;
  window.location.href = current.replace(/#(.*)$/, '') + '#' + path;
};

//strip # from window.location.hash
function get_window_hash_path() {
  return location.hash.substring(1);
};

function register_onhashchange_handlers(hash_to_handlers_mapper) {
  $(window).on("hashchange", function(e) {
    //strip hash out
    hash_path = get_window_hash_path();
    console.log("new hash: ", hash_path);
    //we use hasOwnProperty since we need to check if a handler is 
    // defined for the hash_path
    //object has it, not its parents (in the prototype chain)
    if (hash_to_handlers_mapper.hasOwnProperty(hash_path)) {
      //invoke said handler function
      hash_to_handlers_mapper[hash_path]();
    } else {
      console.warn(`no handler for ${hash_path}`);
    }
  });
};


window.onload = function() {
  register_onhashchange_handlers({
    index: get_all_users_handler,
    get_all_users: get_all_users_handler,
    add_user: add_user_handler,
    edit_user: edit_user_handler,
    delete_user: delete_user_handler});

  window.controller = controllerMaker();
  window.errorStore = errorStoreMaker();
  console.log("on load on load onload")
  let current_hash = get_window_hash_path();
  if (current_hash === "") {
    console.log("defaulting #url to get_all_users");
    current_hash = "index";
    console.log("navigating to: #" + current_hash);
    navigate(current_hash);
  }
  
  $(window).trigger("hashchange");
  
};

function populate_delete_user_page() {
  console.log("populate_delete_user_page");
  $('#delete-user-container #delete-name-box')[0].value = this.user.getName();
  $('#delete-user-container #delete-name-box')[0].readOnly = true;
  $('#delete-user-container #delete-email-box')[0].value = this.user.getEmail();
  $('#delete-user-container #delete-email-box')[0].readOnly = true;

  $('#delete-user-container #delete').off();


  $('#delete-user-container #delete').click(function(e) {
    deleteAndNavigate(this.user.getEmail());
  }.bind(this)); //explain this well

  $('#delete-user-container #cancel').off();
  $('#delete-user-container #cancel').click(setIndexHash);

  setDelHash();
};

function populate_edit_user_page() {
  console.log("populate_edit_user_page");


  $('#edit-user-container #name-box')[0].value = this.user.getName();
  $('#edit-user-container #email-box')[0].value = this.user.getEmail();
  $('#edit-user-container #error-box').text("");
  $('#edit-user-container #error-box').addClass("hidden");

  $('#edit-user-container #done').off()
  $('#edit-user-container #done').click(function(e) {
    updateAndNavigate(this.user.getEmail());
  }.bind(this));

  $('#edit-user-container #cancel').off()
  $('#edit-user-container #cancel').click(setIndexHash)
  setEditHash();
};

function get_all_users_handler() {

  var make_li_for_user = function(user) {

    del_btn = document.createElement("button");
    del_btn.id = "delete";
    del_btn.innerText = "Delete";
    del_btn.onclick = populate_delete_user_page;
    del_btn.user = user;

    edit_btn = document.createElement("button");
    edit_btn.id = "edit";
    edit_btn.innerText = "Edit";
    edit_btn.onclick = populate_edit_user_page;
    edit_btn.user = user;

    let li = document.createElement("li");
    li.innerText = `Name: ${user.getName()}  | Email: ${user.getEmail()}`;
    li.appendChild(del_btn);
    li.appendChild(edit_btn);

    return li;
  };

  console.log("get_all_users_handler");
  hide_all_containers();
  $('#index-container').removeClass("hidden");

  $('#add-user-btn #add').off()
  $('#add-user-btn #add').click(setAddHash);

  let users = window.controller.getUsers();
  let ul = $('#get-all-users-container #users-list')
  ul.empty(); //TODO: slower than removing nodes
  
  for (user of users) {
    let li = make_li_for_user(user);
    ul.append(li);
  };

};

var addUserToModelAndNavigate = function() {
  console.log('addUserToModelAndNavigate');
  let name = $('#add-user-container #name-box')[0].value;
  let email = $('#add-user-container #email-box')[0].value;

  if (window.controller.addUser(name, email)) {
    $('#add-user-container #name-box')[0].value = "";
    $('#add-user-container #email-box')[0].value = "";
    $('#add-user-container #error-box').text("");
    $('#add-user-container #error-box').addClass("hidden");
    setIndexHash();
  } else {
    $('#add-user-container #name-box')[0].value = name;
    $('#add-user-container #email-box')[0].value = email;
    $('#add-user-container #error-box').text(window.errorStore.getError());
    $('#add-user-container #error-box').removeClass("hidden");
    setAddHash();
  }
};

var setAddUserCancel = function() {
  $('#add-user-container #name-box')[0].value = "";
  $('#add-user-container #email-box')[0].value = "";
  $('#add-user-container #error-box').text("");
  $('#add-user-container #error-box').addClass("hidden");
  setIndexHash();
}

function add_user_handler() {
  console.log("add user handler");
  hide_all_containers();
  $('#add-user-container').removeClass("hidden");
  $('#add-user-container #add').off()
  $('#add-user-container #add').click(addUserToModelAndNavigate);
  $('#add-user-container #cancel').off()
  $('#add-user-container #cancel').click(setAddUserCancel);
}


var updateAndNavigate = function(email) {
  console.log("update and navigate");
  let new_name = $('#edit-user-container #name-box')[0].value;
  let new_email = $('#edit-user-container #email-box')[0].value;

  if (window.controller.updateUser(email, new_name, new_email)) {
    setIndexHash();
  } else {
    $('#edit-user-container #error-box').text(window.errorStore.getError());
    $('#edit-user-container #error-box').removeClass("hidden");
  }
};


function edit_user_handler(email) {
  console.log("edit user handler");

  hide_all_containers();
  $('#edit-user-container').removeClass("hidden");

}

var deleteAndNavigate = function(email) {
  console.log("delete and navigate");
  if (window.controller.deleteUser(email)) {
    console.log("user is deleted, before changing the hash");
    setIndexHash();
  } else {
    $('#delete-user-container #error-box').text(window.errorStore.getError());
    $('#delete-user-container #error-box').removeClass("hidden");
  }
};

function delete_user_handler(email) {
  console.log("delete user handler");

  hide_all_containers();
  $('#delete-user-container').removeClass("hidden");
}

var userMaker = function(na, em) {
  var name = na;
  var email = em;

  var getName = function() {
    return name;
  };

  var setName = function(na) {
    name = na;
  };

  var getEmail = function() {
    return email;
  };

  var setEmail = function(em){
    email = em;
  };

  var user = {};
  user.getName = getName;
  user.getEmail = getEmail;
  user.setName = setName;
  user.setEmail = setEmail;
  return user;
};

var modelMaker = function() {
  var userList = [];

  var addUser = function(name, email) {
    userList.push(userMaker(name, email));
  };

  var getUsers = function() {
    return userList;
  };

  function filterByEmail(email) {
    return userList.filter(function(el) {
      return el.getEmail() == email;
    });
  };

  function filterByEmailCompliment(email) {
    return userList.filter(function(el) {
      return el.getEmail() != email;
    });
  };

  function findUserByEmail(email) {
    let usrLst = filterByEmail(email);
    if (usrLst.length > 0) {
      return usrLst[0];
    } else {
      return undefined;
    }
  };
  
  var userExists = function(email) {
    return (filterByEmail(email).length > 0);
  };

  var deleteUser = function(email) {
    var newList = filterByEmailCompliment(email);
    userList = newList;
    console.log("user deleted")
  };
    
  var updateUser = function(email, new_name, new_email) {
    let user = findUserByEmail(email);
    user.setName(new_name);
    user.setEmail(new_email);
  };

  var model = {};
  model.getUsers = getUsers;
  model.addUser = addUser;
  model.userExists = userExists;
  model.findUserByEmail = findUserByEmail;
  model.deleteUser = deleteUser;
  model.updateUser = updateUser;
  return model;
};

var controllerMaker = function() {
  var model = modelMaker();

  var getUsers = function() {
    return model.getUsers();
  };

  var isName = function(name) {
    var non_alphabet_pattern = new RegExp('[^a-zA-Z. ]+');
    var response = non_alphabet_pattern.exec(name);
    if (typeof name == "string" && response == null)
      return true;
    else
      return false;
  };

  var isEmail = function(email) {
    var email_pattern = new RegExp('[^@]+@[^@]+\.[^@]+');
    var response = email_pattern.exec(email);
    if (typeof name == "string" && response !== null) {
      return true;
    } else {
      return false;
    }
  };

  var addUser = function(name, email) {
    if (!isName(name)) {
      window.errorStore.pushError(`name: ${name} is not alphanumeric`);
      return false;
    }

    if (!isEmail(email)) {
      window.errorStore.pushError(`email: ${email} is not a valid email`);
      return false;
    }

    if (model.userExists(email)) {
      window.errorStore.pushError(`email: ${email} already exists in the model`);
      return false;
    }

    model.addUser(name, email);
    return true;
  };


  var updateUser = function(email, new_name, new_email) {

    if (!model.userExists(email)) {
      window.errorStore.pushError(`user with email: ${email} does not exist in the model`)
      return false;
    }

    if (!isName(new_name)) {
      window.errorStore.pushError(`name: ${new_name} is not alphanumeric`);
      return false;
    }

    if (!isEmail(new_email)) {
      window.errorStore.pushError(`email: ${new_email} is not a valid email`);
      return false;
    }

    if (email != new_email && model.userExists(new_email)) {
      window.errorStore.pushError(`email: ${new_email} already exists in the model`);
      return false;
    }

    model.updateUser(email, new_name, new_email);
    return true;
  };


  var deleteUser = function(email) {
    if (!model.userExists(email)) {
      window.errorStore.pushError("user with email: \'%s\' does not exist in the model", email);
      return false;
    }
    model.deleteUser(email);
    return true;
  };

  var findUserByEmail = function(email) {
    return model.findUserByEmail();
  };

  var controller = {};
  controller.getUsers = getUsers;
  controller.addUser = addUser;
  controller.deleteUser = deleteUser;
  controller.updateUser = updateUser;
  controller.findUserByEmail = findUserByEmail;
  return controller;
};

var errorStoreMaker = function() {
  var errorList = [];

  var getError = function() {
    return errorList[0];

  };

  var pushError = function(error) {
    if (errorList.length > 0)
      errorList.pop();

    errorList.push(error);
  };

  var errorStore = {};
  errorStore.pushError = pushError;
  errorStore.getError = getError;
  return errorStore;
};
