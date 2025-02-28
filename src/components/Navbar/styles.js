import newStyled from "@emotion/styled";

export const NavWrapper = newStyled.div({
  flex: 1,
  padding: "12px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "var(--nav-bg, white)",
  borderBottom: "1px solid #dcdfe4",
  maxHeight: 65,
  boxSizing: "border-box",
  position: "sticky",
  top: 0,
});

export const NavItems = newStyled.div({
  display: "flex",
  flex: 1,
  justifyContent: "space-between",
});

export const FlexBox = newStyled.div(
  ({
    gap,
    flexDirection,
    margin,
    padding,
    style,
    width,
    height,
    justifyContent,
    border,
    borderRadius,
  }) => ({
    gap,
    flexDirection,
    margin,
    padding,
    display: "flex",
    width,
    justifyContent,
    height,
    border,
    borderRadius,
    ...style,
  })
);
