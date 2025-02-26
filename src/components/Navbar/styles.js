import newStyled from "@emotion/styled";

export const NavWrapper = newStyled.div({
  width: "100%",
});

export const NavItems = newStyled.div({
  display: "flex",
  flex: 1,
  padding: 24,
  justifyContent: "space-between",
  borderBottom: "1px solid #dcdfe4",
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
