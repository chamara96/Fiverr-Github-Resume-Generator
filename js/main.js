// API
var api = 'https://api.github.com/users/';

// Limit
var limit = 20;

// Page limits
var pageLimit = 5;

var name = '';

// Github url
var guri = 'https://github.com/' + name;

var input = document.getElementById("input_username");
input.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("btn_generate").click();
    }
});

$(document).ready(function () {

    $("#card_2").hide();

    $('#btn_generate').on('click', function (e) {
        name = $('#input_username').val();

        console.log(name);
        if (name && name.length > 0) {
            $("#git_username").empty();
            $("#test123").empty();
            $("#git_skills").empty();
            $("#repolist").empty();
            $("#git_discrip").empty();
            document.getElementById("git_username").innerHTML = '';
            $(".load_hide").hide();

            loadUser();
            loadRepos();
            $("#card_2").show();
        } else {
            document.getElementById("git_username").innerHTML = 'Enter a Github Username';
            $("#card_2").show();
        }



    });

    $("#input_username").keypress(function () {
        $("#git_username").empty();
        $("#test123").empty();
        $("#git_skills").empty();
        $("#repolist").empty();
        $("#git_discrip").empty();
        document.getElementById("git_username").innerHTML = '';

        $(".load_hide").hide();

        $("#card_2").hide();
    });

    $("#input_username").on("click", function () {
        $('#input_username').val('');
        $("#git_username").empty();
        $("#test123").empty();
        $("#git_skills").empty();
        $("#repolist").empty();
        $("#git_discrip").empty();
        document.getElementById("git_username").innerHTML = '';
        $(".load_hide").hide();

        $("#card_2").hide();
    });

});

function loadUser() {
    $.getJSON(api + name + '?callback=?', function (res) {
        var user = res.data;

        if (user.message && user.message.length > 0) {
            document.getElementById("git_username").innerHTML = user.message;
            $(".load_hide").hide();
        }

        else {
            document.getElementById("git_username").innerHTML = user.login;
            $(".load_hide").show();

            if (user.blog && user.blog.length > 0) {
                $('#test123').append(sprintf('<a target="_blank" id="git_blog" style="margin-left: 20px;" href="{0}">{0}</a>', user.blog));
            }

            var followers = user.followers;;
            if (user.followers >= 1000)
                followers = (user.followers / 1000).toFixed(1) + 'k';

            if (user.location && user.location.length > 0) {
                user_loca = user.location;
            } else {
                user_loca = '';
            }

            $('#git_discrip').append(sprintf('On GitHub since {0}, {1} is a developer based in {2} with {3} public repositories and {4} followers.', user.created_at.substring(0, 4), user.login, user_loca, user.public_repos, followers));

        }

    }).fail(function (jqxhr, settings, ex) {
        document.getElementById("git_username").innerHTML = "Server Error, It can be API rate limit exceeded for your IP";
    });
}

function loadRepos() {
    var repos = [];
    // Get all repos
    function loadPage(page) {
        var uri = sprintf('{0}/repos?sort=pushed&page={1}&callback=?',
            api + name, page);
        $.getJSON(uri, function (res) {
            var list = res.data;
            if (list.length === 0 || page > pageLimit)
                return renderRepos();
            Array.prototype.push.apply(repos, list);
            return loadPage(page + 1);
        });
    }

    function renderRepos() {
        repos = repos.filter(function (repo) {
            return !repo.fork;
        });
        // Sort by starts + forks
        repos.sort(function (a, b) {
            return (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count);
        });


        // Top repos
        var topRepos = repos.slice(0, limit);
        for (var i = 0; i < topRepos.length; i++) {
            var repo = topRepos[i];
            // Homepage
            var home = '';
            if (repo.homepage && repo.homepage.length > 0)
                home = sprintf('<a href="{0}"><i class="icon-home icon-white"></i></a>', repo.homepage);
            // Language
            var lang = '';
            if (repo.language && repo.language.length > 0) {
                lang = repo.language;
            } else {
                lang = '';
            }

            if (repo.description && repo.description.length > 0) {
                des = repo.description;
            } else {
                des = '';
            }


            $('#repolist').append(sprintf(
                '<div class="timeline-container wow fadeInUp">' +
                '<div class="content">' +
                '<span class="time">{0}/{8} - {1}/{9}</span>' +
                '<h3 class="title" style="margin-bottom: 0;">{2}</h3>' +
                '<p style="margin-bottom: 10px;">{3}-[Public]</p>' +
                '<p style="color: black">{4}</p>' +
                '<p style="color: black">This repository has {5} stars and {6} forks. If you would like more information about this repository and my contributed code, please visit <a target="_blank" href="{7}">Github</a> on GitHub.</p>' +
                '</div>' +
                '</div>', repo.created_at.substring(5, 7), repo.updated_at.substring(5, 7), repo.name, lang, des, repo.stargazers_count, repo.forks_count, repo.html_url, repo.created_at.substring(0, 4), repo.updated_at.substring(0, 4)
            ));

        }

        // Skills
        var langs = {};
        for (var i = 0; i < repos.length; i++) {
            var repo = repos[i];
            if (repo.language && repo.language.length > 0) {
                if (!(repo.language in langs))
                    langs[repo.language] = 0;
                langs[repo.language] += 1;
            }
        }

        var langStats = [];
        for (var langName in langs) {
            langStats.push([langName, langs[langName]]);
        }
        langStats.sort(function (a, b) {
            return b[1] - a[1];
        });

        // Load colored lang.
        $.getJSON('git_color.json', function (colors) {
            var topLangStats = langStats.slice(0, 15);
            for (var i = 0; i < topLangStats.length; i++) {
                var item = topLangStats[i];

                $('#git_skills').append(sprintf(
                    '<div class="grid-item">' +
                    '<div class="skill-item">' +
                    '<div class="skill-info clearfix">' +
                    '<h4 class="float-left mb-3 mt-0">{2}</h4>' +
                    '<span class="float-right">{1}%</span>' +
                    '</div>' +
                    '<div style="background-color: #F1F1F1;" class="progress">' +
                    '<div style="width: {1}%; background-color: {0}" class="progress-bar"> </div>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
                    colors[item[0]], parseInt(item[1] / repos.length * 100), item[0]
                ));
            }
        });
    }

    loadPage(1);
}


// Help to sprintf a string
function sprintf() {
    var fmt = [].slice.apply(arguments, [0, 1])[0];
    var args = [].slice.apply(arguments, [1]);
    return fmt.replace(/{(\d+)}/g, function (match, idx) {
        return typeof args[idx] != 'undefined' ? args[idx] : match;

    });

}