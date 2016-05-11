jQuery.fn.tableToCSV = function (dateExecuted) {

    var date = new Date(dateExecuted);

    var clean_text = function (text) {
        text = text.replace(/"/g, '""');
        return '"' + text + '"';
    };

    $(this).each(function () {
        var table = $(this);
        var caption = $(this).find('caption').text();
        var title = [];
        var rows = [];

        $(this).find('tr').each(function () {
            var data = [];
            $(this).find('th').each(function () {
                var text = clean_text($(this).text());
                title.push(text);
            });
            $(this).find('td').each(function () {
                var text = clean_text($(this).text());
                data.push(text);
            });
            data = data.join(';');
            rows.push(data);
        });
        title = title.join(';');
        rows = rows.join('\n');

        var csv = title + rows;
        var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        var download_link = document.createElement('a');
        download_link.href = uri;
        var ts = date.getFullYear() + '-' + (date.getMonth() + 1 < 10 ? '0'
            + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
            + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
            + '-T' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours())
            + '-' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
            + '-' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        if (caption == '') {
            download_link.download = ts + '.csv';
        } else {
            download_link.download = caption + '-' + ts + '.csv';
        }
        document.body.appendChild(download_link);
        download_link.click();
        document.body.removeChild(download_link);
    });

};
