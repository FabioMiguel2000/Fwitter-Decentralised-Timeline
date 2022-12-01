import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ReactComponent as Logo } from '../images/Login.svg';

const theme = createTheme({
    palette: {
        background: {
            default: "#5CC4FF"
        },
        primary: {
            main: '#1056AF',
        },
        secondary: {
            main: '#000000',
        },
    },
});

export default function CreateAccount() {
    const handleCreate = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            user: data.get('user'),
            password: data.get('password'),
        });

        // completar aqui
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <Logo height="300px" width="300px" />
                    </div>
                    <Box component="form" onSubmit={handleCreate} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="user"
                            label="User Name"
                            name="user"
                            autoComplete="user"
                            autoFocus
                            sx={{ input: { color: 'primary.main' } }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            sx={{ input: { color: 'primary.main' } }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, borderRadius: 3, bgcolor: 'primary.main' }}
                        >
                            Create Account
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}