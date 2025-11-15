# Installation Guide - Foodiez Project

## Set up Required Software

Install the following software on your system:

- **Visual Studio Code** - Latest version
- **Git** - Version 2.40 or higher
- **Apache NetBeans IDE** - (Recommend Apache NetBeans IDE 17)
- **JDK** - (Recommend JDK-17)
- **SQL Server Management Studio** - (Recommend SQL Server Management Studio 19)
- **Node.js** - Version 18.x or higher (LTS recommended)

---

## Installation Steps

### Create folder and pull all code from Git

1. Open terminal or command prompt
2. Create a folder for the project:

```bash
mkdir Foodiez
cd Foodiez
```

3. Clone the repository from Git:

```bash
git clone https://github.com/trongphuc207/Foodiez.git .
```

Or clone a specific branch:

```bash
git clone -b trongphuc8 https://github.com/trongphuc207/Foodiez.git .
```

---

## Click to run project

### 1. Setup Database
- Open SQL Server Management Studio 19
- Connect to your SQL Server instance
- Create a new database named `foodiez_db`
- Update database credentials in `Foodsell/demo/src/main/resources/application.properties`

### 2. Run Backend (Java Spring Boot)
- Open `Foodsell/demo` folder in Apache NetBeans IDE 17
- Wait for Maven dependencies to download
- Right-click on project → **Run**
- Backend will start on: `http://localhost:8080`

### 3. Run Frontend (React)
- Open `Foodsell/foodsystem` folder in Visual Studio Code
- Open terminal (Ctrl + `)
- Run command:
```bash
npm install
npm start
```
- Frontend will start on: `http://localhost:3000`

---

## Verification

After successful installation and running:

1. **Backend API**: Open browser and navigate to `http://localhost:8080/api`
2. **Frontend App**: Open browser and navigate to `http://localhost:3000`
3. **Database**: Verify tables are created in SQL Server Management Studio

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**
- Backend (8080): Change port in `application.properties`
- Frontend (3000): Change port when prompted or set PORT environment variable

**2. Database Connection Failed**
- Verify SQL Server is running
- Check connection string in `application.properties`
- Ensure database credentials are correct

**3. Maven Build Errors**
- Verify JDK 17 is installed and JAVA_HOME is set
- Run: `./mvnw clean install`

**4. npm Install Errors**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run: `npm install` again

**5. Git Clone Issues**
- Verify Git is installed: `git --version`
- Check network/proxy settings
- Use SSH instead of HTTPS if needed

---

## Additional Configuration

### Environment Variables

Create `.env` file in frontend directory if needed:
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### PayOS Integration (Optional)
Update PayOS credentials in backend `application.properties`:
```properties
payos.client.id=your_client_id
payos.api.key=your_api_key
payos.checksum.key=your_checksum_key
```

---

## Next Steps

After successful installation:
1. Create admin user account
2. Configure payment gateway (PayOS)
3. Test all major features
4. Review API documentation

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/trongphuc207/Foodiez/issues
- Email: trongphuc20704@gmail.com

---

## License

[Add your license information here]
