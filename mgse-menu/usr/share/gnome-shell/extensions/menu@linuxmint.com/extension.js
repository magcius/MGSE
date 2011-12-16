/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

const Mainloop = imports.mainloop;
const GMenu = imports.gi.GMenu;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const AppFavorites = imports.ui.appFavorites;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Signals = imports.signals;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const ICON_SIZE = 16;
const FAV_ICON_SIZE = 30;
const CATEGORY_ICON_SIZE = 20;
const APPLICATION_ICON_SIZE = 20;

let appsys = Shell.AppSystem.get_default();

function AppMenuItem() {
    this._init.apply(this, arguments);
}

AppMenuItem.prototype = {
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function (app, params) {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

        this._app = app;
        this.label = new St.Label({ text: app.get_name() });
        this.addActor(this.label);
        this._icon = app.create_icon_texture(ICON_SIZE);
        this.addActor(this._icon, { expand: false });
    },

    activate: function (event) {
        this._app.activate_full(-1, event.get_time());
        PopupMenu.PopupBaseMenuItem.prototype.activate.call(this, event);
    }

};

function ApplicationButton(app) {
    this._init(app);
}

ApplicationButton.prototype = {
    _init: function(app) {
this.app = app;
        this.actor = new St.Button({ reactive: true, label: this.app.get_name(), style_class: 'application-button', x_align: St.Align.START });
        this.actor._delegate = this;
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: this.app.get_name(), style_class: 'application-button-label' });
        this.icon = this.app.create_icon_texture(APPLICATION_ICON_SIZE);
        this.buttonbox.add_actor(this.icon);
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);
        /*if (this.app.get_description())
this.actor.set_tooltip_text(this.app.get_description());*/
        this.actor.connect('clicked', Lang.bind(this, function() {
this.app.open_new_window(-1);
            appsMenuButton.menu.close();
}));
    }
};
Signals.addSignalMethods(ApplicationButton.prototype);

function PlaceButton(place, button_name) {
    this._init(place, button_name);
}

PlaceButton.prototype = {
    _init: function(place, button_name) {
this.place = place;
        this.button_name = button_name;
        this.actor = new St.Button({ reactive: true, label: this.button_name, style_class: 'application-button', x_align: St.Align.START });
        this.actor._delegate = this;
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: this.button_name, style_class: 'application-button-label' });
        this.icon = place.iconFactory(APPLICATION_ICON_SIZE);
        this.buttonbox.add_actor(this.icon);
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);
        this.actor.connect('clicked', Lang.bind(this, function() {
this.place.launch();
            appsMenuButton.menu.close();
}));
    }
};
Signals.addSignalMethods(PlaceButton.prototype);

function CategoryButton(app) {
    this._init(app);
}

CategoryButton.prototype = {
    _init: function(category) {
        var label;
if (category){
           let icon = category.get_icon();
           if (icon && icon.get_names)
               this.icon_name = icon.get_names().toString();
           else
               this.icon_name = "";
           label = category.get_name();
        }else label = _("All Applications");
        this.actor = new St.Button({ reactive: true, label: label, style_class: 'category-button', x_align: St.Align.START });
        this.actor._delegate = this;
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: label, style_class: 'category-button-label' });
        if (category && this.icon_name){
           this.icon = new St.Icon({icon_name: this.icon_name, icon_size: CATEGORY_ICON_SIZE, icon_type: St.IconType.FULLCOLOR});
           this.buttonbox.add_actor(this.icon);
        }
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);
        //this.actor.set_tooltip_text(category.get_name());
    }
};
Signals.addSignalMethods(CategoryButton.prototype);

function PlaceCategoryButton(app) {
    this._init(app);
}

PlaceCategoryButton.prototype = {
    _init: function(category) {
        this.actor = new St.Button({ reactive: true, label: _("Places"), style_class: 'category-button', x_align: St.Align.START });
        this.actor._delegate = this;
        this.buttonbox = new St.BoxLayout();
        this.label = new St.Label({ text: _("Places"), style_class: 'category-button-label' });
        this.icon = new St.Icon({icon_name: "folder", icon_size: CATEGORY_ICON_SIZE, icon_type: St.IconType.FULLCOLOR});
        this.buttonbox.add_actor(this.icon);
        this.buttonbox.add_actor(this.label);
        this.actor.set_child(this.buttonbox);
    }
};
Signals.addSignalMethods(PlaceCategoryButton.prototype);

function FavoritesButton(app, nbFavorites) {
    this._init(app, nbFavorites);
}

FavoritesButton.prototype = {
    _init: function(app, nbFavorites) {
        this.actor = new St.Button({ reactive: true, style_class: 'applications-menu-favorites-button' });
        
        let monitorHeight = Main.layoutManager.primaryMonitor.height;
        let real_size = (0.7*monitorHeight) / nbFavorites;
        let icon_size = 0.6*real_size;
        if (icon_size>FAV_ICON_SIZE) icon_size = FAV_ICON_SIZE;
        this.actor.style = "padding-top: "+(icon_size/3)+"px;padding-bottom: "+(icon_size/3)+"px;padding-left: "+(icon_size/3)+"px;padding-right: "+(icon_size/3)+"px;"
        
        this.actor.set_child(app.create_icon_texture(icon_size));
        //this.actor.set_tooltip_text(app.get_name()); #Doesn't appear in the right place
        this._app = app;

        this.actor.connect('clicked', Lang.bind(this, function() {
            this._app.open_new_window(-1);
            appsMenuButton.menu.close();
        }));
    }
};

function MintButton(menuAlignment) {
    this._init(menuAlignment);
}

MintButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(menuAlignment) {
        PanelMenu.ButtonBox.prototype._init.call(this, { reactive: true,
                                               can_focus: true,
                                               track_hover: true });

        this.actor.connect('button-press-event', Lang.bind(this, this._onButtonPress));
        this.actor.connect('key-press-event', Lang.bind(this, this._onSourceKeyPress));

        this._menuAlignment = menuAlignment;
        this.menu = null;
        this._resetMenu();
    },

    removeMenu: function() {
        if (this.menu !== null) {
            Main.uiGroup.remove_actor(this.menu.actor);
            Main.panel._menus.removeMenu(this.menu);
        }
    },
    
    _resetMenu: function() {
        this.removeMenu();
        this.menu = new PopupMenu.PopupMenu(this.actor, this._menuAlignment, mintMenuOrientation);
        this.menu.actor.add_style_class_name('application-menu-background');
        this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
        Main.uiGroup.add_actor(this.menu.actor);
        this.menu.actor.hide();

        Main.panel._menus.addMenu(this.menu);
    },

    _onButtonPress: function(actor, event) {
        if (!this.menu.isOpen) {
            // Setting the max-height won't do any good if the minimum height of the
            // menu is higher then the screen; it's useful if part of the menu is
            // scrollable so the minimum height is smaller than the natural height
            let monitor = Main.layoutManager.primaryMonitor;
            this.menu.actor.style = ('max-height: ' +
                                     Math.round(monitor.height - Main.panel.actor.height) +
                                     'px;');
        }
        this.menu.toggle();
    },

    _onSourceKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_space || symbol == Clutter.KEY_Return) {
            this.menu.toggle();
            return true;
        } else if (symbol == Clutter.KEY_Escape && this.menu.isOpen) {
            this.menu.close();
            return true;
        } else if (symbol == Clutter.KEY_Down) {
            if (!this.menu.isOpen)
                this.menu.toggle();
            this.menu.actor.navigate_focus(this.actor, Gtk.DirectionType.DOWN, false);
            return true;
        } else
            return false;
    },

    _onMenuKeyPress: function(actor, event) {
        let symbol = event.get_key_symbol();
        if (symbol == Clutter.KEY_Left || symbol == Clutter.KEY_Right) {
            let focusManager = St.FocusManager.get_for_stage(global.stage);
            let group = focusManager.get_group(this.actor);
            if (group) {
                let direction = (symbol == Clutter.KEY_Left) ? Gtk.DirectionType.LEFT : Gtk.DirectionType.RIGHT;
                group.navigate_focus(this.actor, direction, false);
                return true;
            }
        }
        return false;
    },

    _onOpenStateChanged: function(menu, open) {
        if (open)
            this.actor.add_style_pseudo_class('active');
        else
            this.actor.remove_style_pseudo_class('active');
    },

    destroy: function() {
        this.actor._delegate = null;

        this.menu.destroy();
        this.actor.destroy();

        this.emit('destroy');
    }
};

function ApplicationsButton() {
    this._init();
}

ApplicationsButton.prototype = {
    __proto__: MintButton.prototype,

    _init: function() {
        MintButton.prototype._init.call(this, 1);
        let box = new St.BoxLayout({ name: 'mintMenu' });
        this.actor.add_actor(box);
        this._iconBox = new St.Bin();
        box.add(this._iconBox, { y_align: St.Align.MIDDLE, y_fill: false });
        
        let icon_file = icon_path + "menu.png";
        if (bottomPosition) {
            icon_file = icon_path + "menu-bottom.png";
        }
        let file = Gio.file_new_for_path(icon_file);
        let icon_uri = file.get_uri();
        this._icon = St.TextureCache.get_default().load_uri_sync(1, icon_uri, 22, 22);
        //this._icon = new St.Icon({ icon_name: 'start-here', style_class: 'popup-menu-icon' });
        this._iconBox.child = this._icon;
        if (bottomPosition) {
            this._label = new St.Label({ track_hover: true, style_class: 'application-menu-button-label-bottom'});
        }
        else {
            this._label = new St.Label({ track_hover: true, style_class: 'application-menu-button-label'});
        }
        box.add(this._label, { y_align: St.Align.MIDDLE, y_fill: false });
        this._label.set_text(_(" Menu"));
        
        this._searchInactiveIcon = new St.Icon({ style_class: 'search-entry-icon',
                                           icon_name: 'edit-find',
                                           icon_type: St.IconType.SYMBOLIC });
        this._searchActiveIcon = new St.Icon({ style_class: 'search-entry-icon',
                                         icon_name: 'edit-clear',
                                         icon_type: St.IconType.SYMBOLIC });
        this._searchTimeoutId = 0;
        this._searchIconClickedId = 0;
        this._applicationsButtons = new Array();
        this._selectedItemIndex = null;
        this._previousSelectedItemIndex = null;
        this._activeContainer = null;

        this._display();
        appsys.connect('installed-changed', Lang.bind(this, this.reDisplay));
        AppFavorites.getAppFavorites().connect('changed', Lang.bind(this, this.reDisplay));

        this.menu.connect('open-state-changed', Lang.bind(this, this._onOpenStateToggled));

    },

    _onMenuKeyPress: function(actor, event) {

        let symbol = event.get_key_symbol();

        if (this._activeContainer === null && symbol == Clutter.KEY_Up) {
            this._activeContainer = this.applicationsBox;
            children = this._activeContainer.get_children();
            this._selectedItemIndex = children.length;
        } else if (this._activeContainer === null && symbol == Clutter.KEY_Down) {
            this._activeContainer = this.applicationsBox;
            children = this._activeContainer.get_children();
            this._selectedItemIndex = -1;
        }else if (this._activeContainer === null) {
            this._activeContainer = this.categoriesBox;
            this._selectedItemIndex = -1;
            this._previousSelectedItemIndex = -1;
        }
        
        
        let children = this._activeContainer.get_children();
        
        if (children.length==0){
            this._activeContainer = this.categoriesBox;
            this._selectedItemIndex = -1;
            this._previousSelectedItemIndex = -1;
            children = this._activeContainer.get_children();
        }

        let index = this._selectedItemIndex;

        if (symbol == Clutter.KEY_Up) {
            index = this._selectedItemIndex - 1 < 0 ? 0 : this._selectedItemIndex - 1;
        } else if (symbol == Clutter.KEY_Down) {
            index = this._selectedItemIndex + 1 == children.length ? children.length - 1 : this._selectedItemIndex + 1;
        } else if (symbol == Clutter.KEY_Right && this._activeContainer === this.categoriesBox) {
            this._activeContainer = this.applicationsBox;
            children = this._activeContainer.get_children();
            index = 0;
            this._previousSelectedItemIndex = this._selectedItemIndex;
            this._selectedItemIndex = -1;
        } else if (symbol == Clutter.KEY_Left && this._activeContainer === this.applicationsBox) {
            this._clearSelections(this.applicationsBox);
            this._activeContainer = this.categoriesBox;
            children = this._activeContainer.get_children();
            index = this._previousSelectedItemIndex;
            this._selectedItemIndex = -1;
        } else if (this._activeContainer === this.applicationsBox && (symbol == Clutter.KEY_space || symbol == Clutter.KEY_Return || symbol == Clutter.KP_Enter)) {
            let item_actor = children[this._selectedItemIndex];
            // First mouse button
            item_actor.emit('clicked', 1);
            return true;
        } else {
            return false;
        }

        if (index == this._selectedItemIndex) {
            return true;
        }
        
        if (index>=children.length) index = children.length-1;

        this._selectedItemIndex = index;
        let item_actor = children[this._selectedItemIndex];

        if (!item_actor || item_actor === this.searchEntry) {
            return false;
        }

        item_actor._delegate.emit('enter-event');
        return true;
    },

    _addEnterEvent: function(button, callback) {
        let _callback = Lang.bind(this, function() {
            let parent = button.actor.get_parent();
            if (this._activeContainer === this.categoriesBox && parent !== this._activeContainer) {
                this._previousSelectedItemIndex = this._selectedItemIndex;
            }
            this._activeContainer = parent;
            let children = this._activeContainer.get_children();
            for (let i=0, l=children.length; i<l; i++) {
                if (button.actor === children[i]) {
                    this._selectedItemIndex = i;
                }
            };
            callback();
        });
        button.connect('enter-event', _callback);
        button.actor.connect('enter-event', _callback);
    },

    _clearSelections: function(container) {
        container.get_children().forEach(function(actor) {
            actor.style_class = "category-button";
        });
    },

    _onOpenStateToggled: function(menu, open) {
       if (open) {
           global.stage.set_key_focus(this.searchEntry);
           this._selectedItemIndex = null;
           this._activeContainer = null;
           let scrollBoxHeight = this.favoritesBox.get_allocation_box().y2-this.favoritesBox.get_allocation_box().y1
                                    -(this.searchBox.get_allocation_box().y2-this.searchBox.get_allocation_box().y1);
            if (scrollBoxHeight<300) scrollBoxHeight = 300;
            this.applicationsScrollBox.style = "height: "+scrollBoxHeight+"px;";
       } else {
           this.resetSearch();
           this._clearSelections(this.categoriesBox);
           this._clearSelections(this.applicationsBox);
       }
    },

    reDisplay : function() {
        this._applicationsButtons = new Array();
        this._resetMenu();
        this._display();
    },
   
    _loadCategory: function(dir, top_dir) {
        var iter = dir.iter();
        var nextType;
        if (!top_dir) top_dir = dir;
        while ((nextType = iter.next()) != GMenu.TreeItemType.INVALID) {
            if (nextType == GMenu.TreeItemType.ENTRY) {
                var entry = iter.get_entry();
                if (!entry.get_app_info().get_nodisplay()) {
var app = appsys.lookup_app_by_tree_entry(entry);
                 if (!this.applicationsByCategory[top_dir.get_menu_id()]) this.applicationsByCategory[top_dir.get_menu_id()] = new Array();
this.applicationsByCategory[top_dir.get_menu_id()].push(app);
}
            } else if (nextType == GMenu.TreeItemType.DIRECTORY) {
                this._loadCategory(iter.get_directory(), top_dir);
            }
        }
    },
    
    _scrollToButton: function(button) {
        var current_scroll_value = this.applicationsScrollBox.get_vscroll_bar().get_adjustment().get_value();
        var box_height = this.applicationsScrollBox.get_allocation_box().y2-this.applicationsScrollBox.get_allocation_box().y1;
        var new_scroll_value = current_scroll_value;
        if (current_scroll_value > button.actor.get_allocation_box().y1-10) new_scroll_value = button.actor.get_allocation_box().y1-10;
        if (box_height+current_scroll_value < button.actor.get_allocation_box().y2+10) new_scroll_value = button.actor.get_allocation_box().y2-box_height+10;
        if (new_scroll_value!=current_scroll_value) this.applicationsScrollBox.get_vscroll_bar().get_adjustment().set_value(new_scroll_value);
    },
               
    _display : function() {
        this._activeContainer = null;
        let section = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(section);
        let favoritesTitle = new St.Label({ track_hover: true, style_class: 'favorites-title', text: "Favorites" });
        this.favoritesBox = new St.BoxLayout({ style_class: 'applications-menu-favorites-box', vertical: true });
        
        let rightPane = new St.BoxLayout({ vertical: true });
        
        this.searchBox = new St.BoxLayout({ style_class: 'search_box' });
        rightPane.add_actor(this.searchBox);
        this.searchEntry = new St.Entry({ name: 'searchEntry',
                                     hint_text: _("Type to search..."),
                                     track_hover: true,
                                     can_focus: true });
        this.searchEntry.set_secondary_icon(this._searchInactiveIcon);
        this.searchBox.add_actor(this.searchEntry);
        this.searchActive = false;
        this.searchEntryText = this.searchEntry.clutter_text;
        this.searchEntryText.connect('text-changed', Lang.bind(this, this._onSearchTextChanged));
        this.searchEntryText.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
        this._previousSearchPattern = "";

        this.categoriesApplicationsBox = new St.BoxLayout();
        rightPane.add_actor(this.categoriesApplicationsBox);
        this.categoriesBox = new St.BoxLayout({ style_class: 'categories-box', vertical: true });
        this.applicationsScrollBox = new St.ScrollView({ x_fill: true, y_fill: false, y_align: St.Align.START, style_class: 'vfade applications-scrollbox' });
        
        let vscroll = this.applicationsScrollBox.get_vscroll_bar();
        vscroll.connect('scroll-start',
                        Lang.bind(this, function() {
                                      this.menu.passEvents = true;
                                  }));
        vscroll.connect('scroll-stop',
                        Lang.bind(this, function() {
                                      this.menu.passEvents = false;
                                  }));
        
        this.applicationsBox = new St.BoxLayout({ style_class: 'applications-box', vertical:true });
        this.applicationsScrollBox.add_actor(this.applicationsBox)
        this.applicationsScrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.categoriesApplicationsBox.add_actor(this.categoriesBox);
        this.categoriesApplicationsBox.add_actor(this.applicationsScrollBox);
                     
        //Load favorites
        let launchers = global.settings.get_strv('favorite-apps');
        let appSys = Shell.AppSystem.get_default();
        let j = 0;
        for ( let i = 0; i < launchers.length; ++i ) {
            let app = appSys.lookup_app(launchers[i]);
            if (app) {
                let button = new FavoritesButton(app, launchers.length);
                this.favoritesBox.add_actor(button.actor);
                button.actor.connect('enter-event', Lang.bind(this, function() {
                   this.selectedAppTitle.set_text(button._app.get_name());
                   if (button._app.get_description()) this.selectedAppDescription.set_text(button._app.get_description());
                   else this.selectedAppDescription.set_text("");
                }));
                button.actor.connect('leave-event', Lang.bind(this, function() {
                   this.selectedAppTitle.set_text("");
                   this.selectedAppDescription.set_text("");
                }));
                ++j;
            }
        }
        
                                              
        let applicationsTitle = new St.Label({ style_class: 'applications-title', text: "Applications" });
 
        this.mainBox = new St.BoxLayout({ style_class: 'applications-box', vertical:false });
        //this.rightBox = new St.BoxLayout({ style_class: 'applications-box', vertical:true });
        //this.rightBox.add_actor(this.categoriesApplicationsBox, { span: 1 });
        
//this.mainBox.add_actor(applicationsTitle, { span: 1 });
this.mainBox.add_actor(this.favoritesBox, { span: 1 });
        this.mainBox.add_actor(rightPane, { span: 1 });
        //this.mainBox.add_actor(favoritesTitle, { span: 1 });
        

        section.actor.add_actor(this.mainBox);
        
this.applicationsByCategory = {};
        let tree = appsys.get_tree();
        let root = tree.get_root_directory();
        
        let categoryButton = new CategoryButton(null);
             categoryButton.actor.connect('clicked', Lang.bind(this, function() {
            this._select_category(null, categoryButton);
         }));
         this._addEnterEvent(categoryButton, Lang.bind(this, function() {
             this._select_category(null, categoryButton);
         }));
         this.categoriesBox.add_actor(categoryButton.actor);

        let iter = root.iter();
        let nextType;
        while ((nextType = iter.next()) != GMenu.TreeItemType.INVALID) {
            if (nextType == GMenu.TreeItemType.DIRECTORY) {
                let dir = iter.get_directory();
                this.applicationsByCategory[dir.get_menu_id()] = new Array();
                this._loadCategory(dir);
                if (this.applicationsByCategory[dir.get_menu_id()].length>0){
                   let categoryButton = new CategoryButton(dir);
                   categoryButton.actor.connect('clicked', Lang.bind(this, function() {
                     this._select_category(dir, categoryButton);
                  }));
                  this._addEnterEvent(categoryButton, Lang.bind(this, function() {
                      this._select_category(dir, categoryButton);
                  }));
                   this.categoriesBox.add_actor(categoryButton.actor);
                }
            }
        }
        
        this.placesButton = new PlaceCategoryButton();
        this.placesButton.actor.connect('clicked', Lang.bind(this, function() {
            this._select_places(this.placesButton);
        }));
        this._addEnterEvent(this.placesButton, Lang.bind(this, function() {
            this._select_places(this.placesButton);
        }));
        this.categoriesBox.add_actor(this.placesButton.actor);
        
        // Not necessary yet.. will be used to show all apps in an "all category"
        //for (directory in this.applicationsByCategory) {
// let apps = this.applicationsByCategory[directory];
// for (var i=0; i<apps.length; i++) {
// let app = apps[i];
// }
//}
         
        this.selectedAppBox = new St.BoxLayout({ style_class: 'selected-app-box', vertical: true });
        this.selectedAppTitle = new St.Label({ style_class: 'selected-app-title', text: "" });
        this.selectedAppBox.add_actor(this.selectedAppTitle);
        this.selectedAppDescription = new St.Label({ style_class: 'selected-app-description', text: "" });
        this.selectedAppBox.add_actor(this.selectedAppDescription);
        section.actor.add_actor(this.selectedAppBox);
    },
    
    _clearApplicationsBox: function(selectedActor){
       let actors = this.applicationsBox.get_children();
for (var i=0; i<actors.length; i++) {
let actor = actors[i];
this.applicationsBox.remove_actor(actor);
}
       
       let actors = this.categoriesBox.get_children();

         for (var i=0; i<actors.length; i++){
             let actor = actors[i];
             if (actor==selectedActor) actor.style_class = "category-button-selected";
             else actor.style_class = "category-button";
         }
    },
    
     _select_category : function(dir, categoryButton) {
       this.resetSearch();
       this._clearApplicationsBox(categoryButton.actor);
       if (dir) this._displayButtons(this._listApplications(dir.get_menu_id()));
       else this._displayButtons(this._listApplications(null));
},
    
    _displayButtons: function(apps, places){
         if (apps){
            for (var i=0; i<apps.length; i++) {
               let app = apps[i];
               if (!this._applicationsButtons[app]){
                  let applicationButton = new ApplicationButton(app);
                  applicationButton.actor.connect('leave-event', Lang.bind(this, function() {
                     this.selectedAppTitle.set_text("");
                     this.selectedAppDescription.set_text("");
                  }));
                  this._addEnterEvent(applicationButton, Lang.bind(this, function() {
                      this.selectedAppTitle.set_text(applicationButton.app.get_name());
                      if (applicationButton.app.get_description()) this.selectedAppDescription.set_text(applicationButton.app.get_description());
                      else this.selectedAppDescription.set_text("");
                      this._clearSelections(this.applicationsBox);
                      applicationButton.actor.style_class = "category-button-selected";
                      this._scrollToButton(applicationButton);
                  }));
                  this._applicationsButtons[app] = applicationButton;
               }
               this.applicationsBox.add_actor(this._applicationsButtons[app].actor);
            }
         }

         if (places){
            for (var i=0; i<places.length; i++) {
               let place = places[i];
               let button = new PlaceButton(place, place.name);
               this._addEnterEvent(button, Lang.bind(this, function() {
                   this._clearSelections(this.applicationsBox);
                   button.actor.style_class = "category-button-selected";
                   this._scrollToButton(button);
               }));
               this.applicationsBox.add_actor(button.actor);
            }
         }
    },
     
     _select_places : function(button) {
         this.resetSearch();
this._clearApplicationsBox(button.actor);
         
         //let places = Main.placesManager.getDefaultPlaces();
         //for (let id = 0; id < places.length; id++) {
         // let button = new PlaceButton(places[id], places[id].name);
         // this.applicationsBox.add_actor(button.actor);
         //}
         
         let bookmarks = this._listBookmarks();
         let devices = this._listDevices();
         this._displayButtons(null, bookmarks.concat(devices));
},
     
     resetSearch: function(){
        this.searchEntry.set_text("");
        this.searchActive = false;
        global.stage.set_key_focus(this.searchEntry);
     },
     
     _onSearchTextChanged: function (se, prop) {
        this._clearSelections(this.categoriesBox);
        this._clearSelections(this.applicationsBox);
        this.searchActive = this.searchEntry.get_text() != '';
        if (this.searchActive) {
            this.searchEntry.set_secondary_icon(this._searchActiveIcon);

            if (this._searchIconClickedId == 0) {
                this._searchIconClickedId = this.searchEntry.connect('secondary-icon-clicked',
                    Lang.bind(this, function() {
                        this.resetSearch();
                    }));
            }
        } else {
            if (this._searchIconClickedId > 0)
                this.searchEntry.disconnect(this._searchIconClickedId);
            this._searchIconClickedId = 0;

            this.searchEntry.set_secondary_icon(this._searchInactiveIcon);
        }
        if (!this.searchActive) {
            if (this._searchTimeoutId > 0) {
                Mainloop.source_remove(this._searchTimeoutId);
                this._searchTimeoutId = 0;
            }
            return;
        }
        if (this._searchTimeoutId > 0)
            return;
        this._searchTimeoutId = Mainloop.timeout_add(150, Lang.bind(this, this._doSearch));
    },
    
    _listBookmarks: function(pattern){
       let bookmarks = Main.placesManager.getBookmarks();
       var res = new Array();
       for (let id = 0; id < bookmarks.length; id++) {
          if (!pattern || bookmarks[id].name.toLowerCase().indexOf(pattern)!=-1) res.push(bookmarks[id]);
       }
       return res;
    },
    
    _listDevices: function(pattern){
       let devices = Main.placesManager.getMounts();
       var res = new Array();
       for (let id = 0; id < devices.length; id++) {
          if (!pattern || devices[id].name.toLowerCase().indexOf(pattern)!=-1) res.push(devices[id]);
       }
       return res;
    },
    
    _listApplications: function(category_menu_id, pattern){
       var applist;
       if (category_menu_id) applist = this.applicationsByCategory[category_menu_id];
       else{
          applist = new Array();
          for (directory in this.applicationsByCategory) applist = applist.concat(this.applicationsByCategory[directory]);
       }
       
       var res;
       if (pattern){
          res = new Array();
          for (var i in applist){
             let app = applist[i];
             if (app.get_name().toLowerCase().indexOf(pattern)!=-1 || (app.get_description() && app.get_description().toLowerCase().indexOf(pattern)!=-1)) res.push(app);
          }
       }else res = applist;
       
       res.sort(function(a,b){
          return a.get_name().toLowerCase() > b.get_name().toLowerCase();
       });
       
       return res;
    },
    
    _doSearch: function(){
       this._searchTimeoutId = 0;
       let pattern = this.searchEntryText.get_text().replace(/^\s+/g, '').replace(/\s+$/g, '').toLowerCase();
       if (pattern==this._previousSearchPattern) return false;
       this._previousSearchPattern = pattern;
       
       this._activeContainer = null;
       this._selectedItemIndex = null;
       this._previousSelectedItemIndex = null;
       
       // _listApplications returns all the applications when the search
       // string is zero length. This will happend if you type a space
       // in the search entry.
       if (pattern.length == 0) {
           return false;
       }

       var appResults = this._listApplications(null, pattern);
       
       var placesResults = new Array();
       
       var bookmarks = this._listBookmarks(pattern);
       for (var i in bookmarks) placesResults.push(bookmarks[i]);
       
       var devices = this._listDevices(pattern);
       for (var i in devices) placesResults.push(devices[i]);
       
       this._clearApplicationsBox();
       this._displayButtons(appResults, placesResults);

       return false;
    }
};

const MenuPosition = {
    INITIALIZING: 0,
    TOP: 1,
    BOTTOM: 2
};

function MenuExtension() {
    this._init();
}

MenuExtension.prototype = {
    _init: function() {
        this.appsMenuButton = new ApplicationsButton();
        this.currentPosition = MenuPosition.INITIALIZING;
        this._activitiesButtonLabel = Main.panel._activitiesButton._label.get_text();
        this._disappearingId = 0;
    },

    enable: function() {
        Main.panel._mintMenuExtension = this;

        /* Look for mintPanel */
        if (Main.panel._mintPanel !== null) {
            this.moveToBottom();
        } else {
            this.moveToTop();
        }
    },

    disable: function() {
        this._undoEverything();
        Main.panel._mintMenuExtension = null;
    },

    _undoEverything: function() {
        if (this.currentPosition === MenuPosition.TOP) {
            let activitiesButton = Main.panel._activitiesButton;
            Main.panel._rightBox.remove_actor(activitiesButton.actor);
            Main.panel._leftBox.insert_actor(activitiesButton.actor, 0);
            activitiesButton._label.set_text(this._activitiesButtonLabel);

            this.appsMenuButton.removeMenu();
            Main.panel._leftBox.remove_actor(this.appsMenuButton.actor);
        } else if (this.currentPosition === MenuPosition.BOTTOM) {
            this.appsMenuButton.removeMenu();
            Main.panel._mintPanel.leftBox.remove_actor(this.appsMenuButton.actor);
            Main.panel._mintPanel.disconnect(this._disappearingId);
        }
    },

    moveToTop: function() {
        this._undoEverything();
        this.currentPosition = MenuPosition.TOP;

        let activitiesButton = Main.panel._activitiesButton;
        Main.panel._leftBox.remove_actor(activitiesButton.actor);
        Main.panel._rightBox.insert_actor(activitiesButton.actor,
                                          Main.panel._rightBox.get_children().length);
        activitiesButton._label.set_text("-");

        Main.panel._leftBox.insert_actor(this.appsMenuButton.actor, 0);
    },

    moveToBottom: function() {
        this._undoEverything();
        this.currentPosition = MenuPosition.BOTTOM;
        Main.panel._mintPanel.leftBox.insert_actor(this.appsMenuButton.actor, 0);
        this._disappearingId = Main.panel._mintPanel.connect('disappearing',
                                                             Lang.bind(this, this.moveToTop));
    },
};

let icon_path;

function init(metadata) {
    icon_path = metadata.path + '/icons/';
    return new MenuExtension();
}
