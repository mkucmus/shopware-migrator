module.exports = ({id, name, is_active, include_in_menu}, parentId = null) => (
  {
    "visible": is_active && include_in_menu,
    "active": is_active && include_in_menu,
    "name": name,
    "parentId": parentId
  }
)