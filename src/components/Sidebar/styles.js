import styled from "@emotion/styled";

export const SideBarWrapper = styled.div(({ showSideBar }) => ({
  width: showSideBar ? 280 : 0,
  background: "#121621",
  color: "#b3b9c6",
  userSelect: "none",
  padding: showSideBar ? "24px 24px 0px 24px" : 0,
  fontWeight: 400,
  fontSize: 20,
  ".logo": {
    display: showSideBar ? "flex" : "none",
    color: "white",
    cursor: "pointer",
    strong: {
      color: "#5221e6",
    },
  },
}));

export const SideBarItemsWrapper = styled.ul(() => {
  return {
    margin: "20px 0 0 0",
    padding: "20px 0 0 0",
    gap: 8,
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid #434a60",
  };
});

export const ListItems = styled.li(({ selected, showSideBar }) => {
  const additionalStyles = selected
    ? {
        backgroundColor: "#635bff",
        color: "#fff",
      }
    : {};
  return {
    alignItems: "center",
    borderRadius: "8px",
    color: "#ffffffb3",
    cursor: "pointer",
    height: 32,
    display: showSideBar ? "flex" : "none",
    flex: "0 0 auto",
    gap: "8px",
    padding: "6px 16px",
    position: "relative",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    ...additionalStyles,
    ":hover": {
      color: "#0ff",
    },
  };
});
