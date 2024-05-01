$(function(){
    $('#feedbackDenybtn').on('click', function(event) {
        if(event.button == 0) {
            event.preventDefault();
            hideFeedback();
        }
    });
});

function showFeedback(message, type) {
    let widget = $('#feedback');
    let messageElement = $('#feedbackMessage');

    widget.css('display', 'block');
    messageElement.text(message);

    if (type === 'success') {
        widget.removeClass('alert-danger alert-info').addClass('alert-success');
    } else if (type === 'error') {
        widget.removeClass('alert-success alert-info').addClass('alert-danger');
    } else if (type === 'info') {
        widget.removeClass('alert-danger alert-success').addClass('alert-info');
    }
}

function hideFeedback() {
    $('#feedback').css('display', 'none');
}