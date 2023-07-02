const bcrypt = require("bcrypt");
const users = require("../models/index.js").users;
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");
const { throwError } = require("../utils/throwError")
const path = require("path")
const fs = require('fs')

class BusinessUserService {
  async registerUser(data) {
    try {
      const modelData = {};

      if (data.name) {
        modelData.name = data.name;
      }

      if (data.email) {
        modelData.email = data.email;
      }

      if (data.phone) {
        modelData.phone = data.phone;
      }

      if (data.gender) {
        modelData.gender = data.gender;
      }

      const result = await users.count({
        where: { email: data.email },
      });

      if (result === 0) {
        modelData.password = await this.hashPassword(data.password);
        const modelResult = await users.create(modelData);
        return {
          statusCode: 200,
          status: true,
          msg: "User Created Successfully",
          data: modelResult
        }
      }else {
        throwError(403, false, "User already present with the provided email address")
      }
    } catch (err) {
      return err;
    }
  }

  async listAllUser() {
    try {
      const result = await users.findAll({raw: true})
      if(result){
        return ({
          statusCode: 200,
          status: true,
          data: result,
          msg: "All users data",
        });
      }else {
        throwError(404, false, "Unable to get all users")
      }
    } catch(err) {
        return JSON.parse(err.message)
    }
  }

  async loginUser(data) {
    try {
      const result = await users.findOne({
        where: { email: data.email },
      });

      if (result) {
        let passwordHash = result.toJSON().password;
        const compareResult = await this.comparePassword(
          data.password,
          passwordHash
        );

        if (compareResult) {
          let token = jwt.sign(data, config.secret_token, {
            expiresIn: 259200,
          }); //sec
          return ({
            statusCode: 200,
            status: true,
            msg: "Successfully Logged in",
            data: token,
          });
        } else {
          throwError(401, false, "Wrong Credentials")
        }
      } else {
        throwError(404, false, "No user found")
      }
    } catch (err) {
      return JSON.parse(err.message)
    }
  }

  // async resetPassword(data) {
  //   try {
  //     const otpResult = await otpModel.findOne({where: {email: data.email, otp: data.otp}})
        
  //       if(otpResult.dataValues.isActive === false) {
  //         const hashPassword = await this.hashPassword(data.newPassword);
  //         await users.update(
  //           { password: hashPassword },
  //           { where: { email: data.email } }
  //         );
  //       }else {
  //         throwError(401, false, "OTP not verified, can't change the password !")
  //       }

  //       return ({
  //         statusCode: 200,
  //         status: true,
  //         msg: "Password Changed Successfully",
  //       });
  //   } catch(err) {
  //       return JSON.parse(err.message)
  //   }
  // }

  async changePassword(data) {
    try {
      console.log(data)
      const result = await this.loginUser(data);
      if (result.data) {
        const hashPassword = await this.hashPassword(data.newPassword);
          await users.update(
            { password: hashPassword },
            { where: { email: data.email } }
        );

        return ({
          statusCode: 200,
          status: true,
          msg: "Password Changed Successfully",
        });
      } else {
        throwError(401, false, "Wrong Credentials")
      }
    } catch(err) {
        return JSON.parse(err.message)
    }
  }

  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const result = await bcrypt.hash(password, salt);
      return result;
    } catch (err) {
      return err;
    }
  }

  async comparePassword(password, hash) {
    try {
      const result = await bcrypt.compare(password, hash)
      return result
    } catch (err) {
      return err
    }
  }

  async profileUpdate(data) {
    try {
      const modelData = {};

      if (data.name) {
        modelData.name = data.name;
      }

      if (data.phone) {
        modelData.phone = data.phone;

        const result = await users.findOne({where: {phone: data.phone}})
        if(result) {
          throwError(403, false, "User already present with the provided phone number.")
        }
      }

      if (data.gender) {
        modelData.gender = data.gender;
      }

      console.log(modelData)

      await users.update(
        modelData,
        {where: {email: data.email}}
      ) 

      return ({
        statusCode: 200,
        status: true,
        msg: "User data updated successfully.",
      })
      
    } catch(err) {
      return err
    }
  }

  async getProfileDetails(data) {
    try {
      const result = await users.findOne({where: {email: data.email}})
      if(result) {
        return ({
          statusCode: 200,
          status: true,
          data: result
        })
      }else {
        throwError(404, false, "Unable to get User Data")
      }
    }catch(err) {
      return JSON.parse(err.message)
    }
  }

  async uploadProfileImage(data, req) {

    try {
      let imgUrl = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename
      const result = await users.update({profile_pic: imgUrl}, {where: {email: data.email}})
      
      if(result) {
        return ({
          statusCode: 200,
          status: true,
          msg: `Profile image saved`,
          path:  imgUrl
        })
      }
    }catch (err) {
      return err
    }
  }

  async deleteProfileImage(data) {
    try {
      const profileResult = await users.findOne({where: {email: data.email}, raw: true})

      if(profileResult) {
        if(profileResult.profileImagePath) {
          let pathList = profileResult.profileImagePath.split("/")
          let filename = pathList[pathList.length - 1]
          let imgFullPath = path.join(__dirname, '../../', 'uploads') + '/' + filename

          fs.unlink(imgFullPath, async (err) => {
            if (err) {
              throwError(400, false, err)
            }

            const updateResult = await users.update({profileImagePath: null}, {where: {email: data.email}})

            if(updateResult) {
              return ({
                statusCode: 200,
                status: true,
                msg: `Profile image removed !`
              })
            }
          })
        }else {
          throwError(404, false, `No Profile Image found for the user !`)  
        }
      }else{
        throwError(404, false, "Unable to find the user")
      }
    }catch (err) {
      return JSON.parse(err.message)
    }
  }

  async findUserProfile(data) {
    try {
      const result = await users.findOne({where: {email: data.email}})
      if(result) {
        return ({
          statusCode: 200,
          status: true,
        })
      }else {
        throwError(404, false, "Incorrect email or Email Address")
      }
    }catch(err) {
      return JSON.parse(err.message)
    }
  }
}

module.exports = BusinessUserService;
