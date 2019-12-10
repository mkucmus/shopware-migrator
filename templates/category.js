module.exports = ({id, name, is_active, include_in_menu}, parentId = "4a20c82211ef41e5874b66bd9b554f2a") => (
  {
    "visible": is_active && include_in_menu,
    "active": is_active && include_in_menu,
    "name": name,
    "parentId": parentId
  }
)