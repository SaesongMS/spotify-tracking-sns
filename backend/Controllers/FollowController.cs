using Microsoft.AspNetCore.Mvc;
using Models;
using Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using DTOs;


namespace Controllers;
[ApiController]
[Route("api/follows")]
public class FollowController : ControllerBase
{
    private readonly FollowService _followService;
    private readonly AuthenticationService _authenticationService;

    public FollowController(FollowService followService, AuthenticationService authenticationService)
    {
        _followService = followService;
        _authenticationService = authenticationService;
    }

    [HttpPost("create")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<ActionResult> FollowUser([FromBody] FollowRequest request)
    {
        var nameIdentifier = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        try
        {
            var user = await _authenticationService.GetUser(nameIdentifier);
            if (await _followService.FollowUser(request.UserId, user))
                return Ok(new FollowResponse
                {
                    Success = true,
                    Message = "Followed successfully"
                });
            return BadRequest(new FollowResponse
            {
                Success = false,
                Message = "Failed to follow user"
            });
        }
        catch (Exception e)
        {
            return BadRequest(new { message = e.Message });
        }
    }

    [HttpDelete("delete")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<ActionResult> UnfollowUser([FromBody] FollowRequest request)
    {
        var nameIdentifier = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        try
        {
            var user = await _authenticationService.GetUser(nameIdentifier);
            if (await _followService.UnfollowUser(request.UserId, user))
                return Ok(new FollowResponse
                {
                    Success = true,
                    Message = "Unfollowed successfully"
                });
            return BadRequest(new CreateCommentResponse
            {
                Success = false,
                Message = "Failed to unfollow user"
            });
        }
        catch (Exception e)
        {
            return BadRequest(new { message = e.Message });
        }
    }
}