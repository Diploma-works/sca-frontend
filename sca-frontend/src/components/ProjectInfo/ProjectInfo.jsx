import { Box, Button, Dialog, DialogActions, Divider, Stack, Typography, useTheme } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Editor } from "@monaco-editor/react";

// TODO: migrate to DialogTitle, DialogContent and so on
export const ProjectInfo = ({ open, setOpen }) => {
    const theme = useTheme();

    const handleClose = () => setOpen(false);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <Stack direction="row" spacing={1} p={1} pl={1.5} justifyContent="space-between" alignItems="center">
                <Typography noWrap variant="subtitle2">Запрос информации о проекте</Typography>
                <Button
                    color="inherit"
                    disableElevation
                    sx={{
                        p: 0,
                        minWidth: 0,
                        color: 'text.secondary',
                    }}
                    onClick={handleClose}
                >
                    <CloseRoundedIcon fontSize="small"/>
                </Button>
            </Stack>
            <Divider/>
            <Typography variant="body2" px={1.5} py={1}>Введите ваш запрос на SCAQL в поле ниже:</Typography>
            <Box p={1.5} pt={0}>
                <Editor
                    height="400px"
                    theme={theme.palette.mode === 'dark' ? 'sca-dark' : 'sca-light'}
                    language="SCAQL"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        automaticLayout: true,
                    }}
                />
            </Box>
            <Divider/>
            <DialogActions sx={{ p: 1.5 }}>
                <Button variant="contained">Отправить запрос</Button>
            </DialogActions>
        </Dialog>
    )
}