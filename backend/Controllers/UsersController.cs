using Helpers;
using DTOs;
using Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
  private readonly JWTCreator _jwtCreator;
  private readonly AuthenticationService _authenticationService;
  private readonly UserService _userService;

  public UsersController(JWTCreator jwtCreator, AuthenticationService authenticationService, UserService userService)
  {
    _jwtCreator = jwtCreator;
    _authenticationService = authenticationService;
    _userService = userService;
  }

  [HttpPost("register")]
  public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
  {
    try
    {
      var result = await _authenticationService.Register(registerRequest);

      if (result.Item1)
      {
        var result2 = await _authenticationService.AddRole(registerRequest.Username, "User");
        if (!result2)
          return BadRequest(new RegisterResponse { Success = false, Message = "Could not add role to user" });
        return Ok(new RegisterResponse { Success = true, Message = "Registration successful" });
      }

      return BadRequest(new RegisterResponse { Success = false, Message = result.Item2.ToString() });
    }
    catch (Exception ex)
    {
      return BadRequest(new RegisterResponse { Success = false, Message = ex.Message });
    }
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
  {
    try
    {
      var result = await _authenticationService.Login(loginRequest);

      if (result)
      {
        var user = await _authenticationService.GetUser(loginRequest.Username);
        var roles = await _authenticationService.GetRoles(loginRequest.Username);
        var token = _jwtCreator.Generate(user, roles);

        Response.Cookies.Append("X-Access-Token", token, new CookieOptions
        {
          HttpOnly = true,
          SameSite = SameSiteMode.Strict,
          Expires = DateTimeOffset.UtcNow.AddDays(7)
        });
        var id = _userService.GetIdByUserName(loginRequest.Username).Result;
        return Ok(new LoginResponse { Success = true, Message = "Login successful", Id = id });
      }

      return BadRequest(new LoginResponse { Success = false, Message = "Bad credentials" });
    }
    catch (Exception ex)
    {
      return BadRequest(new LoginResponse { Success = false, Message = ex.Message });
    }
  }

  [HttpPost("logout")]
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public async Task<IActionResult> Logout()
  {
    try
    {
      Response.Cookies.Delete("X-Access-Token");
      Response.Cookies.Delete(".AspNetCore.Identity.Application");
      return Ok(new { Success = true, Message = "Logout successful" });
    }
    catch (Exception ex)
    {
      return BadRequest(new { Success = false, Message = ex.Message });
    }
  }

  [HttpGet("ping")]
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public IActionResult Ping()
  {
    return Ok(new { Success = true, Message = "Pong" });
  }

  [HttpGet("admin")]
  [Authorize(Roles = "Admin")]
  public IActionResult Admin()
  {
    var id = _userService.GetIdByUserName(ClaimTypes.NameIdentifier).Result;
    return Ok(new { Success = true, Message = "Admin", User = ClaimTypes.NameIdentifier, Id = id });
  }

  [HttpGet("user")]
  [Authorize(Roles = "User,Admin")]
  public IActionResult user()
  {
    var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var id = _userService.GetIdByUserName(username!).Result;
    return Ok(new { Success = true, Message = "User", User = username, Id = id });
  }

  [HttpGet("{username}")]
  public async Task<IActionResult> UserProfileData(string username)
  {
    try
    {
      var data = await _userService.FetchProfileData(username);

      if (data != null)
        return Ok(data);
      else
        return BadRequest(new { Success = false, Message = "User was not found" });
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error fetching profile data: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpPatch("{username}")]
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public async Task<IActionResult> UserBioAvatarEdit(string username, [FromBody] EditUsersProfileRequest request)
  {
    var nameIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    try
    {
      var user = await _authenticationService.GetUser(nameIdentifier);
      var response = await _userService.EditProfileData(username, request.Bio, request.Avatar, user.Id);

      switch (response)
      {
        case 200:
          return Ok(new { Success = true, Message = "User was successfully edited" });
        case 404:
          return NotFound(new { Success = false, Message = "User was not found in database" });
        case 403:
          return Unauthorized(new { Success = false, Message = "Unauthorized attempt to edit users profile data" });
        case 400:
          return BadRequest(new { Success = false, Message = "Error updating database" });
        default:
          return StatusCode(500, new { Success = false, Message = "An unexpected error occurred" });
      }

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error editing profile data: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpPost("connectSpotify")]
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public async Task<IActionResult> ConnectSpotify([FromBody] ConnectSpotifyRequest request)
  {
    var nameIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

    try
    {
      var user = await _authenticationService.GetUser(nameIdentifier);
      var response = await _userService.ConnectSpotify(request.RefreshToken, request.Id_User_Spotify_API, user.Id);

      if (response)
        return Ok(new { Success = true, Message = "Spotify account was successfully connected" });
      else
        return BadRequest(new { Success = false, Message = "Error connecting Spotify account" });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error connecting Spotify account: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpPatch("disconnectSpotify")]
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public async Task<IActionResult> DisconnectSpotify()
  {
    var nameIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

    try
    {
      var user = await _authenticationService.GetUser(nameIdentifier);
      var response = await _userService.DisconnectSpotify(user.Id);

      if (response)
        return Ok(new { Success = true, Message = "Spotify account was successfully disconnected" });
      else
        return BadRequest(new { Success = false, Message = "Error disconnecting Spotify account" });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error disconnecting Spotify account: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpGet("most-active")]
  public async Task<IActionResult> MostActiveUsers()
  {
    try
    {
      var data = await _userService.FetchMostActiveUsers();

      if (data != null)
        return Ok(data);
      else
        return BadRequest(new { Success = false, Message = "No users found" });
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error fetching most active users: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpGet("compability")]
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public async Task<IActionResult> Compability([FromQuery] string user_id)
  {
    var nameIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

    try
    {
      var user = await _authenticationService.GetUser(nameIdentifier);
      var response = await _userService.Compability(user_id, user.Id);

      if (response.Item1 != -1)
        return Ok(new { Success = true, Message = "Compability was successfully calculated", Compability = response.Item1, Artists = response.Item2 });
      else
        return BadRequest(new { Success = false, Message = "Error calculating compability" });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error calculating compability: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpPost("change-password")]
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
  public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
  {
    string? nameIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    try
    {
      (bool success, string errors) = await _authenticationService.ChangePassword(nameIdentifier!, request.OldPassword, request.NewPassword);

      if (success)
        return Ok(new { Success = true, Message = "Password was successfully reset" });
      else
        return BadRequest(new { Success = false, Message = errors });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error resetting password: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpPatch("bio")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> ChangeBio([FromBody] ChangeBioRequest request)
  {
    try
    {
      var response = await _userService.ChangeBio(request.UserId, request.EditedBio);

      if (response)
        return Ok(new { Success = true, Message = "Bio was successfully changed" });
      else
        return BadRequest(new { Success = false, Message = "Error changing bio" });

    }
    catch (Exception e)
    {
      Console.WriteLine($"Error changing bio: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

  [HttpPatch("avatar")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> ChangeAvatar([FromBody] ChangeAvatarRequest request)
  {
    try
    {
      (bool success, byte[] avatar) = await _userService.ChangeAvatar(request.UserId, request.Avatar);

      if (success)
        return Ok(new { Success = true, Message = "Avatar was successfully changed", Avatar = avatar });
      else
        return BadRequest(new { Success = false, Message = "Error changing avatar" });
    }
    catch (Exception e)
    {
      Console.WriteLine($"Error changing avatar: {e}");
      return BadRequest(new { Success = false, Message = e });
    }
  }

}