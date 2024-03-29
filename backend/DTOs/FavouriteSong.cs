using System.ComponentModel.DataAnnotations;
using Models;

namespace DTOs;

public class FavouriteSongRequest
{
    [Required]
    public string SongId { get; set; } = string.Empty;
}

public class FavouriteSongResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public FavouriteSong? FavouriteSong { get; set; }
}

public class FavouriteSongListResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<FavouriteSong>? FavouriteSongs { get; set; }
}
