module.exports = {
        profilePageReset: function() {
                document.getElementById('tblProfile').style.display = 'block';
                document.getElementById('tblPassword').style.display = 'none';

                document.getElementById('lblfName').style.display = 'inline';
                document.getElementById('lbllName').style.display = 'inline';

                document.getElementById('editfName').style.display = 'none';
                document.getElementById('editlName').style.display = 'none';

                document.getElementById('editButton').style.display = 'inline';
                document.getElementById('changePasswordButton').style.display = 'inline';
                document.getElementById('submitEditButton').style.display = 'none';
                document.getElementById('cancelEditButton').style.display = 'none';
                document.getElementById('submitPasswordButton').style.display = 'none';
                document.getElementById('cancelPasswordButton').style.display = 'none';
        },

        editProfile: function() {
                document.getElementById('editfName').value = "";
                document.getElementById('editlName').value = "";

                document.getElementById('tblProfile').style.display = 'block';
                document.getElementById('tblPassword').style.display = 'none';

                document.getElementById('lblfName').style.display = 'none';
                document.getElementById('lbllName').style.display = 'none';

                document.getElementById('editfName').style.display = 'inline';
                document.getElementById('editlName').style.display = 'inline';

                document.getElementById('editButton').style.display = 'none';
                document.getElementById('changePasswordButton').style.display = 'none';
                document.getElementById('submitEditButton').style.display = 'inline';
                document.getElementById('cancelEditButton').style.display = 'inline';
                document.getElementById('submitPasswordButton').style.display = 'none';
                document.getElementById('cancelPasswordButton').style.display = 'none';
        }
};