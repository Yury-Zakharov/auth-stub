{
  description = "Isolated development shell ([add tools here])";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devshell.url = "github:Yury-Zakharov/nix-devshell";
  };

  outputs = { self, nixpkgs, devshell }:
    let
      # Single declaration site for this project's modules
      extraModules = [
        devshell.modules.base
        devshell.modules.dotnet
        devshell.modules.typescript
        # ... add/remove only here
      ];
      description = "i4ce assignment.";
      system = "x86_64-linux";

      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true;
        overlays = devshell.overlays;
      };


      devShell = devshell.lib.mkDevShell { inherit pkgs extraModules; };
    in
    {
      devShells.${system}.default = devShell;
      
      # CI-friendly outputs (GitHub Actions, nix build, etc.)
      packages.${system}.default = devShell;
      checks.${system}.default   = devShell;
    };
}
