import $ from 'jquery';

//this class handles the notes feature and provide the ability to Create, Edit, and Delete.
class MyNotes {
    constructor() {
        this.events();
    }

    //UPDATE: I change the tag hook from tagging the only property (e.g= ".delete-note"),
    //to all the classes "#my-notes", this helps me to let javaScript recognizes new posted notes.
    events() {
        $("#my-notes").on("click", ".delete-note", this.deleteNote);
        $("#my-notes").on("click", ".edit-note", this.editNote.bind(this));
        $("#my-notes").on("click", ".update-note", this.updateNote.bind(this));
        $(".submit-note").on("click", this.createNote.bind(this));
    }

    //in delete method I used ajax method to handle the delete action. 
    // I provide nonce to be authorized to do an action. This is an attribute in WordPress
    // I can get the specific note by targeting the card note (HTML "li" tag) by lable it with an id.
    deleteNote(e) {
        var thisNote = $(e.target).parents("li");
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
            },
            url: universityData.root_url + '/wp-json/wp/v2/note/' + thisNote.data('id'),
            type: 'DELETE',
            //In success property if the note reached the limit then I remove the text message
            //that appered when user tried to create new note while the user reached the limit.
            success: (response) => {
                if(response.userNoteCount <= 30) {
                    $(".note-limit-message").removeClass("active");
                }
                thisNote.slideUp();
                console.log("Post Deleted");
                console.log(response);
            },
            error: (response) => {
                console.log("Sorry");
                console.log(response);
            },
        });
    }

    // in editNote I checked the state of the note either in edit mode or in readonly mode so I can perfourm action and show the right HTML/CSS styling.
    editNote(e) {
        var thisNote = $(e.target).parents("li");
        if(thisNote.data("state") == "editable"){
            this.makeNoteReadOnly(thisNote);
        } else {
            this.makeNoteEditable(thisNote);
        }
        
    }

    //in edit mode I use JQuery method "find" to locate the right HTML tag and set it to the right situation.
    //Also, I use removeAttr to remove the readolny attribute when a user click on edit button.
    //And, I use addClass method to focus on the field text when the user in edit mode
    makeNoteEditable(thisNote){
        thisNote.find(".edit-note").html('<i class="fa fa-times" aria-hidden="ture"></i> Cancel');
        thisNote.find(".note-title-field, .note-body-field").removeAttr("readonly").addClass("note-active-field");
        thisNote.find(".update-note").addClass("update-note--visible");
        thisNote.data("state", "editable");
    }

    // this method is opposite of makeNoteEditable. I remove any classes that added from makeNoteEditable method.
    makeNoteReadOnly(thisNote){
        thisNote.find(".edit-note").html('<i class="fa fa-pencil" aria-hidden="ture"></i> Edit');
        thisNote.find(".note-title-field, .note-body-field").attr("readonly", "readonly").removeClass("note-active-field");
        thisNote.find(".update-note").removeClass("update-note--visible");
        thisNote.data("state", "cancel");
    }

    
    //this function works similrly to editNote with a few changes.
    //first I added new var (ourUpdatePost) that holds new values when a user editing note.
    //Also, add new attribute in in ajax method that takes new values form the new var and actualy update them by sending request to WordPress database.
    updateNote(e) {
        var thisNote = $(e.target).parents("li");
        var ourUpdatePost = {
            'title' : thisNote.find(".note-title-field").val(),
            'content' : thisNote.find(".note-body-field").val()
        }
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
            },
            url: universityData.root_url + '/wp-json/wp/v2/note/' + thisNote.data('id'),
            type: 'POST',
            data: ourUpdatePost,
            success: (response) => {
                this.makeNoteReadOnly(thisNote);
                console.log("Post Updated");
                console.log(response);
            },
            error: (response) => {
                console.log("Sorry");
                console.log(response);
            },
        });
    }

    
    //In create note, the structure method is almost the same as the updateNote method.
    //There is a change in success property where I inforce to let javaScript recognize the new posted notes.
    createNote(e) {
        var ourNewPost = {
            'title' : $(".new-note-title").val(),
            'content' : $(".new-note-body").val(),
            'status': 'publish'
        }
        $.ajax({
            beforeSend: (xhr) => {
                xhr.setRequestHeader('X-WP-Nonce', universityData.nonce);
            },
            url: universityData.root_url + '/wp-json/wp/v2/note/',
            type: 'POST',
            data: ourNewPost,
            success: (response) => {
                $(".new-note-title, .new-note-body").val('');
                $(`
                <li data-id="${response.id}">
                    <input readonly class="note-title-field" value="${response.title.raw}">
                    <span class="edit-note"><i class="fa fa-pencil" aria-hidden="ture"></i>Edit</span>
                    <span class="delete-note"><i class="fa fa-trash-o" aria-hidden="ture"></i>Delete</span>
                    <textarea readonly class="note-body-field">${response.content.raw}</textarea>
                    <span class="update-note btn btn--blue btn small"><i class="fa fa-arrow-right" aria-hidden="ture"></i>Save</span>
                </li>
                `).prependTo("#my-notes").hide().slideDown();
                console.log("Note Created");
                console.log(response);
            },
            //In error property I show to user a message that he/she reached limit.
            error: (response) => {
                if(response.responseText == "You have reached your note limit.") {
                    $(".note-limit-message").addClass("active");
                }
                console.log("Sorry");
                console.log(response);
            },
        });
    }
}

export default MyNotes;