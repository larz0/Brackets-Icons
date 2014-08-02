define(function(require, exports, module) {
	var fileInfo = {};

	function addIcon(extension, icon, color, size) {
		fileInfo[extension] = {
			icon: icon,
			color: color,
			size: size
		};
	}
	function addAlias(extension, other) {
		fileInfo[extension] = fileInfo[other];
	}
	function getDefaultIcon(extension) {
		if (extension === '') {
			return {
				color: '#fff',
				icon: '\uf12f'
			};
		}

		var hue = 0;
		var saturnation = 90;
		var lightness = 50;

		for (var i = 0; i < extension.length; ++i) {
			hue += extension.charCodeAt(i) * 42 * (i + 2);
			hue %= 256;
			saturnation = (saturnation + (extension.charCodeAt(i) % 30) + 70) / 2;
			lightness = (lightness + (extension.charCodeAt(i) * 3 % 40) + 30) / 2;
		}

		return {
			color: 'hsl(' + Math.round(hue) + ', ' + Math.round(saturnation) + '%, ' + Math.round(lightness) + '%)',
			icon: '\uf12f'
		};
	}

	// XML
	addIcon('xml',    '\uf271', '#ffffff');
	addIcon('html',   '\uf271', '#ffffff');
	addAlias('htm', 'html');

	// Stylesheets
	addIcon('css',    '\uf219', '#ffffff', 12);
	addIcon('scss',   '\uf219', '#ffffff', 12);
	addAlias('sass',  'scss');
	addIcon('less',   '\uf219', '#ffffff', 12);
	addIcon('styl',   '\uf219', '#ffffff', 12);

	// JavaScript
	addIcon('js',     '\uf2db', '#ffffff', 12);
	addIcon('ts',     '\uf2db', '#ffffff', 12);
	addIcon('coffee', '\uf272', '#ffffff');
	addIcon('json',   '\uf195', '#ffffff');
	addIcon('ls',     '\uf269', '#ffffff');

	// Server side
	addIcon('php',    '\uf270', '#ffffff');
	addIcon('sql',    '\uf2fe', '#ffffff');

	// Java
	addIcon('java',   '\uf272', '#ffffff');
	addAlias('class', 'java');

	// Shell and friends
	addIcon('sh',     '\uf12e', '#ffffff');
	addIcon('bat',    '\uf247', '#ffffff');

	// Templating
	addIcon('jade',   '\uf277', '#ffffff');

	// Images
	addIcon('png',    '\uf147', '#ffffff');
	addIcon('jpg',    '\uf147', '#ffffff');
	addAlias('jpeg',  'jpg');
	addIcon('tiff',   '\uf147', '#ffffff');
	addIcon('ico',    '\uf147', '#ffffff');
	addIcon('svg',    '\uf147', '#ffffff');

	addIcon('gif',    '\uf148', '#ffffff');

	// Videos
	addIcon('mp4',    '\uf1f3', '#ffffff');
	addAlias('webm',  'mp4');
	addAlias('ogg',   'mp4');

	// Audio
	addIcon('mp3',    '\uf259', '#ffffff');
	addAlias('wav',   'mp3');

	// Fonts
	addIcon('ttf',    '\uf241', '#ffffff');
	addIcon('eot',    '\uf241', '#ffffff');
	addIcon('woff',    '\uf241', '#ffffff');

	// Readme
	addIcon('md',     /*'\uf12e'*/ '\uf2d0', '#ffffff', 12);
	addAlias('markdown', 'md');

	// Git
	addIcon('gitignore', '\uf207', '#ffffff', 14);
	addIcon('gitmodules', '\uf2c0', '#ffffff', 17);

	// Webservers
	addIcon('htaccess', '\uf1f0', '#ffffff', 18);
	addIcon('htpasswd', '\uf1a8', '#ffffff', 18);
	addIcon('conf',   '\uf195', '#ffffff');

	// Archive
	addIcon('zip',    '\uf283', '#ffffff');
	addIcon('rar',    '\uf283', '#ffffff');
	addIcon('7z',     '\uf283', '#ffffff');
	addIcon('tgz',    '\uf283', '#ffffff');
	addIcon('tar',    '\uf283', '#ffffff');
	addIcon('gz',     '\uf283', '#ffffff');
	addIcon('bzip',   '\uf283', '#ffffff');

	// Settings
	addIcon('project', '\uf195', '#ffffff');
	addAlias('jscsrc', 'project');
	addAlias('jshintrc', 'project');
	addAlias('csslintrc', 'project');
	addAlias('todo', 'project');
	addAlias('classpath', 'project');

	// Other text files
	addIcon('txt',    '\uf12e', '#ffffff');
	addIcon('log',    '\uf2e6', '#ffffff');
	addIcon('npmignore', '\uf207', '#ffffff', 14);
	addIcon('yml',   '\uf20e', '#ffffff');

	var ProjectManager = brackets.getModule('project/ProjectManager');
	var DocumentManager = brackets.getModule('document/DocumentManager');
	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "styles/style.css");

	function renderFiles() {
		$('#project-files-container ul').removeClass('jstree-no-icons').addClass('jstree-icons');

		var $items = $('#project-files-container li>a');

		$items.each(function(index) {
			var ext = ($(this).find('.extension').text() || $(this).text().substr(1) || '').substr(1).toLowerCase();
			var lastIndex = ext.lastIndexOf('.');
			if (lastIndex > 0) {
				ext = ext.substr(lastIndex + 1);
			}
            
			var data;

			if ($(this).parent().hasClass('jstree-leaf')) {
				data = fileInfo.hasOwnProperty(ext) ? fileInfo[ext] : getDefaultIcon(ext);
			} else {
				return;
			}

			var $new = $(this).find('.jstree-icon');
			$new.text(data.icon);
			$new.addClass('file-icon');
			$new.css({
				color: data.color,
				fontSize: (data.size || 16) + 'px'
			});
		});
	}
	function renderWorkingSet() {
		$('#open-files-container li>a>.file-icon').remove();

		var $items = $('#open-files-container li>a');

		$items.each(function(index) {
			var ext = ($(this).find('.extension').text() || $(this).text() || '').substr(1).toLowerCase();
			var lastIndex = ext.lastIndexOf('.');
			if (lastIndex > 0) {
				ext = ext.substr(lastIndex + 1);
			}

			var data = fileInfo.hasOwnProperty(ext) ? fileInfo[ext] : getDefaultIcon(ext);

			var $new = $('<div>');
			$new.text(data.icon);
			$new.addClass('file-icon');
			$new.css({
				color: data.color,
				fontSize: (data.size || 16) + 'px'
			});
			$(this).prepend($new);
		});
	}

	function projectOpen() {
		var events = 'load_node.jstree create_node.jstree set_text.jstree';

		renderFiles();

		$('#project-files-container').off(events, renderFiles);
		$('#project-files-container').on(events, renderFiles);
	}

	$(ProjectManager).on('projectOpen projectRefresh', projectOpen);

	$(DocumentManager).on("workingSetAdd workingSetAddList workingSetRemove workingSetRemoveList fileNameChange pathDeleted workingSetSort", function() {
		renderWorkingSet();
	});

	projectOpen();
	renderWorkingSet();
});
